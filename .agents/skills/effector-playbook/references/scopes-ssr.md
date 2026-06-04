# Isolated scopes

import Tabs from "@components/Tabs/Tabs.astro";
import TabItem from "@components/Tabs/TabItem.astro";
import SideBySide from "@components/SideBySide/SideBySide.astro";

## Isolated scopes

With scopes you can work with isolated instance for the entire application, which contains an independent clone of all units (including connections between them) and basic methods to access them:

```ts "fork" "allSettled"
import { fork, allSettled, createStore, createEvent } from "effector";

// create a new scope
const scope = fork();

const $counter = createStore(0);
const increment = createEvent();

$counter.on(increment, (state) => state + 1);

// trigger the event and wait for the entire chain to complete
await allSettled(increment, { scope });

console.log(scope.getState($counter)); // 1
console.log($counter.getState()); // 0 - the original store remains unchanged
```

Using fork, we create a new scope, and with allSettled we run a chain of events and effects inside the specified scope and wait for it to complete.

> INFO Scope Independence: 
>
> There is no mechanism for sharing data between scopes; each instance is fully isolated and operates independently.

### Why do we need a scope?

In effector, all state is stored globally. In a client-side application (SPA), this is not a problem: each user gets their own instance of the code and works with their own state. But with server-side rendering (SSR) or parallel testing, global state becomes a problem: data from one request or test can "leak" into another. That's why we need a scope.

* **SSR** - the server runs as a single process and serves requests from many users. For each request, you can create a scope that isolates data from effector's global scope and prevents one user's state from leaking into another user's request.
* **Testing** - when running tests in parallel, data races and state collisions may occur. A scope allows each test to run with its own isolated state.

We provide detailed guides on working with server-side rendering (SSR) and testing. Here, we'll focus on the core principles of using scopes, their rules, and how to avoid common mistakes.

### Rules for working with scopes

To ensure scopes work correctly, there are a few rules to prevent scope loss:

#### Effect and promise calls

For effect handlers that call other effects, ensure to only call effects, not common asynchronous functions. Furthermore, effect calls should be awaited.

Imperative calls of effects are safe because effector remembers the scope in which the imperative call of the effect began and restores it after the call, allowing for another call in sequence.

You can call methods like `Promise.all([fx1(), fx2()])` and others from the standard JavaScript API because in these cases, the calls to effects still happen synchronously, and the scope is safely preserved.



```ts wrap data-border="good" data-height="full"
// OK: correct usage for an effect without inner effects
const delayFx = createEffect(async () => {
  await new Promise((resolve) => setTimeout(resolve, 80));
});

// OK: correct usage for an effect with inner effects
const authFx = createEffect(async () => {
  await loginFx();

  await Promise.all([loadProfileFx(), loadSettingsFx()]);
});
```



```ts wrap data-border="bad" data-height="full"
// BAD: incorrect usage for an effect with inner effects

const sendWithAuthFx = createEffect(async () => {
  await authUserFx();

  // incorrect! This should be wrapped in an effect.
  await new Promise((resolve) => setTimeout(resolve, 80));

  // scope is lost here.
  await sendMessageFx();
});
```



> INFO get attached: 
>
> For scenarios where an effect might call another effect or perform asynchronous computations, but not both, consider utilizing the attach method instead for more succinct imperative calls.

#### Using units with frameworks

Always use the `useUnit` hook with frameworks so effector can invoke the unit in the correct scope:

```tsx wrap "useUnit"
import { useUnit } from "effector-react";
import { $counter, increased, sendToServerFx } from "./model";

const Component = () => {
  const [counter, increase, sendToServer] = useUnit([$counter, increased, sendToServerFx]);

  return (
    <div>
      <button onClick={increase}>{counter}</button>
      <button onClick={sendToServer}>send data to server</button>
    </div>
  );
};
```

Alright, just show me how it works already.

### Using in SSR

Imagine a website with SSR, where the profile page shows a list of the user's personal notifications. If we don't use a scope, here's what happens:

* User A makes a request -> their notifications load into `$notifications` on the server.
* Almost at the same time, User B makes a request -> the store is overwritten with their data.
* As a result, both users see User B's notifications.

Not what we want, right? This is a [race condition](https://en.wikipedia.org/wiki/Race_condition), which leads to a leak of private data.

With a scope, we get an isolated context that only works for the current user:
A request is made -> a scope is created -> we update state only inside this scope. This works for each request.


```tsx "fork" "allSettled" "serialize"
// server.tsx
import { renderToString } from "react-dom/server";
import { fork, serialize, allSettled } from "effector";
import { Provider } from "effector-react";
import { fetchNotificationsFx } from "./model";

async function serverRender() {
  const scope = fork();

  // Load data on the server
  await allSettled(fetchNotificationsFx, { scope });

  // Render the app
  const html = renderToString(
    <Provider value={scope}>
      <App />
    </Provider>,
  );

  // Serialize state to send to the client
  const data = serialize(scope);

  return `
	<html>
	  <body>
		<div id="root">${html}</div>
		<script>window.INITIAL_DATA = ${data}</script>
	  </body>
	</html>
`;
}
```


```tsx
// client.tsx
import { hydrateRoot } from "react-dom/client";
import { fork } from "effector";

// hydrate scope with initial values
const scope = fork({
  values: window.INITIAL_DATA,
});

hydrateRoot(
  document.getElementById("root"),
  <Provider value={scope}>
    <App />
  </Provider>,
);
```


Things to note in this example:

1. We serialized data using serialize to correctly transfer it to the client.
2. On the client, we hydrated the stores using the .

### Related APIs and Articles

* **API**

  * Scope - Description of scope and its methods
  * scopeBind - Method for binding a unit to a scope
  * fork - Operator for creating a scope
  * allSettled - Method for running a unit in a given scope and waiting for the entire chain of effects to complete
  * serialize - Method for obtaining serialized store values
  * hydrate - Method for hydrating serialized data

* **Articles**

  * What is scope loss and how to fix it
  * SSR guide
  * Testing guide
  * The importance of SIDs for store hydration
