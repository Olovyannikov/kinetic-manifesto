## PART I: THE KINETIC MANIFESTO

### Chapter 1: The Reactive Mindset

You have been lied to.

For years, frontend development has been sold to you as "Component State." You were told to shove your business logic, your data fetching, and your complex decision trees inside the visual layer—inside React components, inside `useEffect`, inside specific framework lifecycles.

This is a structural failure. It is a violation of the Separation of Concerns principle so egregious that it has cost the industry billions of dollars in technical debt.

When you couple your application's **Logic** (the "Rules") with its **View** (the "Renderer"), you create a fragile system. You create a system where moving a button breaks the checkout process. You create a system where testing the logic requires spinning up a headless browser (JSDOM/Cypress), which is slow, flaky, and expensive. You create spaghetti code that no one wants to touch because the "Display" and the "Data" are fused together like melted plastic.

Effector is not a "state management library" in the way Redux, MobX, or Zustand presented themselves. Those are libraries for storing data. Effector is a **Runtime Logic Engine**. It is a way to construct the brain of your application separately from the body. It allows you to build a system that runs in a void—independent of React, Vue, or the DOM—and then simply "projects" its state onto a screen.

#### 1.1 The Inversion of Control

In the imperative world (standard React, plain JS), you tell the computer *how* to do things, step by step, usually inside an event handler:

> *"When the user clicks the button, read the input value. Then, check if it's valid. If it is, start a loader. Then, fetch the API. Then, save the result..."*

This is fragile. If you need to trigger this flow from somewhere else (e.g., a keyboard shortcut), you have to duplicate the logic or wrap it in a hook that is hard to test.

In the Effector (Declarative/Functional Reactive Programming) world, you define the *relationships* between events and reality. You construct a pipeline, a topology of data:

> *"The Input Store is the source. The Button Click is the clock. When the clock ticks, sample the source. Filter by validity. Target the API Effect."*

You are building a circuit board. You wire the connections once during the application boot. Then, you let the electricity (data) flow through it. You don't manage the flow manually; the circuit manages it based on the laws of physics you defined.

#### 1.2 The Single Truth: Events and Reactions

Stop thinking in "updates." Start thinking in "reactions."

In a legacy mindset, you think: *"I need to update the user store."* This leads to imperative setters exposed everywhere.
In a Kinetic mindset, you think: *"What **caused** this change? Is it a User Login? A Token Refresh? A Profile Update?"*

We do not manually set values. We **react** to signals.

*   We do NOT say: `setUser(data)`.
*   We say: `fetchProfileFx.doneData` **is connected to** `$user`.

This seems like semantics. It is not. It is the difference between spaghetti code and a **Directed Acyclic Graph (DAG)**. In a DAG, you can trace the lineage of every piece of data. You know exactly where it came from. There is no hidden mutation. There is no `this.state =`. There is only **Cause** and **Effect**.

#### 1.3 The Myth of "Global" State

Here is where the documentation usually fails you. They tell you to create global variables. `$user`, `$counter`.

This works for a Hello World. It fails in production. It fails in Micro-Frontends. It fails in Server-Side Rendering (SSR).

In a real, scalable architecture—the kind we are building in this playbook—we don't just dump variables in the global scope. We build **Models**. We use **Factories** (via `@withease/factories`).

A "Model" is a self-contained graph of logic. It describes how a specific feature *works*, not just what data it *holds*.
*   The "Login Feature" is a model.
*   The "User Session" is a model.
*   The "Product List" is a model.

These models communicate through explicit public APIs (Events and Stores). They do not reach into each other's guts to mutate state.

#### 1.4 The Law of No Abstractions

Effector gives you low-level primitives. `createEvent`, `createStore`, `createEffect`, `sample`.

**Do not fear the verbosity.**

Junior developers try to hide these wires. They create generic `makeApiRequest` wrappers that hide the logic. They create "Base Stores" that try to handle everything generically.
Senior developers (You) expose the wires. We want to see the flow. We want to see exactly how the `submit` event triggers the `validate` logic, which triggers the `post` effect.

If you hide the wiring, you hide the bugs. In this playbook, we embrace the "explicit." We write the `sample`. We write the connections. We make the logic **Visual** through code.

#### 1.5 Deprecated Paradigms: The Kill List

Based on the latest directives from the Core team and modern architectural standards, the following concepts are **DEAD**:

1.  **`guard`**: This was the old way to stop a signal based on a condition. It has been fully absorbed by `sample`. Using `guard` now just signals that you haven't read the changelog since 2021.
    *   **Replacement:** Use `sample({ filter: ... })`.
2.  **Imperative `.getState()`**: Reading a store value imperatively inside a thunk or event handler is a race condition waiting to happen. It reads the value at the *wrong time* (execution time vs. trigger time).
    *   **Replacement:** Always use `sample` with `source: $store`. Let the engine handle the timing/synchronicity.
3.  **`.watch`**: You used this to "do things" when an event fired. "I'll just log here," or "I'll just route here." Stop. `.watch` breaks the reactive chain. It is a side effect that the graph doesn't see.
    *   **Replacement:** Use `effector/inspect` for logging. Use `sample` + `Effect` for side effects.
4.  **`createDomain`**: It was an attempt to group units. It failed. It adds overhead, leaks memory if not careful, and provides "magic" hooks (`onCreateStore`) that make logic hard to trace.
    *   **Replacement:** Use factories/models to group units logically via file structure. Use Scope for isolation.
5.  **`forward`**: A redundant artifact. It simply connects an event to a target. `sample` does this better and allows for future expansion (adding source/filter) without rewriting the operator.
    *   **Replacement:** Use `sample({ clock: source, target: destination })`.

---

### Chapter 2: The Trinity of Primitives

Listen closely. In the Effector universe, you are not building objects and classes. You are not writing reducers and actions that live in different folders because "Redux said so."

You are handling three fundamental types of matter. These are your Lego bricks. Your atoms. Master these, and you master the physics of your application. They are: **Events** (The Impulse), **Stores** (The Memory), and **Effects** (The Work).

Everything else in Effector is just glue to hold these three together.

#### 2.1 Events: The Impulse

An `Event` is a declaration of intent. It is a signal that something *happened*.
It has no state. It does not hold data over time. It fires, carries a payload, and vanishes into the void. Think of it like a pistol shot—you hear the bang, you see the bullet, and then it's over.

**Syntax:**
```typescript
import { createEvent } from 'effector';

// An event without data (a void signal)
const submitPressed = createEvent();

// An event carrying specific data (Typed)
const emailChanged = createEvent<string>();
```

**The Mental Model:**
Do not name events as commands (`updateEmail`). Name them as occurrences (`emailChanged`). A command implies you know what will happen. An occurrence implies you are just broadcasting news. The *logic* decides what happens next, not the event itself.

**Transformation:**
Events are cheap. You can create derived events from other events using `.map()`, `.filter()` or `.prepend()`.

```typescript
// Transforming the payload: Pure logic only.
const emailNormalized = emailChanged.map(email => email.trim().toLowerCase());
```

*Note:* `emailNormalized` triggers whenever `emailChanged` triggers, but with a cleaned-up payload. Pure functions only inside `.map`. No side effects.

#### 2.2 Stores: The Memory

A `Store` is a container for a value that changes over time. It is your "State."
Unlike Redux, we do not have one giant God-Object. We have **Atomic Stores**. Small, focused units of state that represent one specific thing.

**Syntax:**
```typescript
import { createStore } from 'effector';

// Initial state is mandatory.
const $email = createStore<string>('');
const $counter = createStore(0);
```

*The `$` prefix:* This is Hungarian notation. It is optional, but if you don't use it, you are making your life harder. `$name` tells your brain immediately: "This is a reactive store, not a static string."

**The Golden Rule of Mutation:**
You **cannot** mutate a store imperatively. You will not find a `$email.setValue('test')` method. This is by design. If you could change stores from anywhere, your app would be unmanageable chaos.

Stores change **only** in reaction to Units (Events, Effects, or other Stores).

**The Basic Updater (`.on`):**
For simple updates, use `.on()`. It’s a reducer attached directly to the store.

```typescript
$email.on(emailChanged, (currentValue, newPayload) => newPayload);

// If the reducer returns UNDEFINED, the update is skipped.
// If the reducer returns the SAME reference, the update is skipped.
```

**Modern Resetting (`.reinit`):**
In the old days, we used `.reset()`. It was messy syntax sugar.
Now, every store has a `.reinit()` method. It is an event that, when triggered, sets the store back to its initial value (the one you passed to `createStore`).

```typescript
const formClosed = createEvent();

// Explicit, readable, clean.
sample({
  clock: formClosed,
  target: $email.reinit
});
```

**Derived Stores:**
Do not manually sync stores. If Store B depends on Store A, map it.

```typescript
const $isValid = $email.map(email => email.includes('@'));
```
`$isValid` is not a separate state you have to manage. It is a shadow of `$email`. It is always consistent.

**The Atomic Database (Normalization)**
Beginners often create Atomic Stores containing massive arrays (`createStore<User[]>`). This is an anti-pattern. If you update User #5, you create a new reference for the whole array, triggering re-renders for *all* list items.

**The Rule:** Normalize your entities.
1.  `$userIds`: `Store<string[]>` (The order/list).
2.  `$usersById`: `Store<Record<string, User>>` (The data dictionary).

**Why:** When User 5 updates their name, you update *one* key in the `$usersById` record. The `$userIds` store remains referentially equal. Only the specific row component subscribed to User 5 will re-render. This is the companion pattern to `useStoreMap`.

#### 2.3 Effects: The Work

This is where Effector leaves the competition in the dust.
An `Effect` is a container for a side effect—usually an async operation like an API call. But it is not *just* a function. It is a reactive entity with built-in state.

**Syntax:**
```typescript
import { createEffect } from 'effector';

const saveUserFx = createEffect(async (user: User) => {
  const response = await api.post('/users', user);
  return response.data;
});
```

**The Built-in Lifecycle:**
Every time you create an effect, Effector gives you free logic units attached to it. You don't need to write them. They just exist.

1.  **`saveUserFx.pending`**: A `Store<boolean>`. `true` when the effect is running. Bind this directly to your spinner.
2.  **`saveUserFx.doneData`**: An `Event` that fires with the *result* on success.
3.  **`saveUserFx.failData`**: An `Event` that fires with the *error* on failure.
4.  **`saveUserFx.inFlight`**: A `Store<number>`. How many requests are currently active?

**Why this changes the game:**
In other libraries, handling loading states and errors is boilerplate hell. In Effector, it looks like this:

```typescript
// Wiring the result directly to state
const $currentUser = createStore<User | null>(null);

$currentUser.on(saveUserFx.doneData, (_, user) => user);

// Handling the error
const $error = createStore<string>('');

$error.on(saveUserFx.failData, (_, error) => error.message);
$error.reset(saveUserFx.done); // Clear error on success
```

Clean. Readable. No `try/catch` blocks inside your components. The Effect *is* the `try/catch`.

#### 2.4 The Graph (Internal Mechanics)

It is crucial to understand that Effector builds a **Graph** at startup. When you write `sample`, you are creating a link (a Node) in memory.
When an event fires, Effector performs a **Topological Sort** of the graph. It calculates the execution order of all dependencies.
*   React uses a "Two-Phase Commit" (Render -> Commit).
*   Effector uses a "Push-Pull" model. It pushes data through pure functions and pulls data from stores only when necessary.

This guarantees consistency. If Event A triggers Store B and Store C, and Store D depends on both B and C, Effector ensures D updates exactly once, with the final values of B and C.

---

## PART II: THE LOGIC ENGINE (FLOW CONTROL)

### Chapter 3: The Pulse - `sample`

This is it. If you learn only one thing from this entire Playbook, learn `sample`.

`sample` is the heartbeat of your application. It is the only operator that truly matters for flow control. Everything else is either syntactic sugar or a specialized utility. `sample` is the Universal Operator.

In a declarative system, you don't say "do X, then do Y". You say "When X happens, if Condition C is met, take Data D, transform it, and put it into Y."

`sample` is the function that defines this sentence.

#### 3.1 The Anatomy of `sample`

The `sample` function is a configuration object. It takes pieces of your graph and wires them together. It resolves strictly, synchronously, and logically.

```typescript
sample({
  clock: Unit | Unit[],   // WHEN: The trigger. (Event, Effect, Store)
  source: Unit | Object,  // WITH: The data you need. (Store, Object of Stores)
  filter: Unit | Fn,      // IF: The gatekeeper. (Store, Predicate function)
  fn: Function,           // TRANSFORM: The mapper. (Data prep)
  target: Unit | Unit[]   // THEN: The destination. (Event, Effect, Store)
});
```

Let's break down the mechanics.

**1. The `clock` (The Trigger)**
This is what starts the reaction. It can be a user click (Event), a server response (Effect.done), or a value changing ($store).
*   If you pass an array `[eventA, eventB]`, the sample fires if *any* of them triggers.

**2. The `source` (The Context)**
This is the data you need *at the moment* the clock ticks.
Crucially, `sample` resolves the `source` **at the exact instant the clock fires**. This eliminates race conditions. You are not reading "current state" arbitrarily; you are grabbing the state exactly when the trigger happens.
*   If you omit `source`, the `clock`'s payload becomes the data.

**3. The `filter` (The Guard)**
The bouncer. If this function returns `false`, the signal stops dead. It never reaches the target.
*   It can be a boolean store: `$isValid`.
*   It can be a function receiving `(sourceData, clockData)`.

**4. The `fn` (The Transformation)**
The place for pure logic. Prepare the data for the target.
*   It receives `(sourceData, clockData)`.
*   It must be **PURE**. No side effects here. Just math.

**5. The `target` (The Effect)**
Where the result goes.
*   If `target` is a Store, it updates the store.
*   If `target` is an Effect, it calls the effect.
*   If `target` is an Event, it triggers the event.
*   **Target is optional.** If you omit it, `sample` returns a *new Unit* (usually an Event) that fires whenever the logic completes. This is powerful for creating "Derived Events."

#### 3.2 The Race Condition Killer

This is the classic bug in imperative code (e.g., inside a React `useEffect` or a Thunk):

```javascript
// IMPERATIVE TRASH 🗑️
async function handleCheckout() {
  const cart = await getCart(); // wait...
  const user = globalUser; // What if user changed while we waited?
  // Who knows what state the app is in now?
  api.buy(cart, user);
}
```

Here is the Kinetic `sample` equivalent. It is atomic.

```typescript
// KINETIC PRECISION 💎
sample({
  clock: checkoutPressed,        // Trigger
  source: {                      // Grab THESE values RIGHT NOW
    cart: $cartItems,
    user: $currentUser
  },
  filter: $isAuthorized,         // Only if authorized
  target: buyFx                  // Execute
});
```

Effector freezes time. When `checkoutPressed` fires, it grabs the cart and user **in the same tick**. There is no `await`. There is no gap for state to drift. It is transactionally consistent.

#### 3.3 The `target` Chaining Pattern

One `sample` connects two nodes. To build a workflow, you chain them. This creates a traceable pipeline.

```typescript
// Step 1: Validate form on submit
sample({
  clock: formSubmitted,
  source: $formData,
  filter: validateForm, // pure function
  target: formValidReceived
});

// Step 2: Send API request if valid
sample({
  clock: formValidReceived,
  target: submitApiFx
});

// Step 3: Notification on success
sample({
  clock: submitApiFx.done,
  fn: () => "Success!",
  target: showNotification
});
```

*Wait, why not put it all in one function?*
Because each step is distinct. Step 1 is validation logic. Step 2 is network logic. Step 3 is UI logic. Separating them means you can test Step 1 without mocking an API. You can trigger `formValidReceived` manually in a test to skip validation and test the network layer.

#### 3.4 Handling Arguments: The `fn` Signature

The `fn` argument is the common stumbling block. Remember the order: **(Source, Clock)**.

> *Mnemonic:* **S.C.** (Source, Clock). You look at the Source (Context) first, then the Clock (Trigger).

```typescript
sample({
  clock: buttonClicked, // payload: MouseEvent
  source: $username,    // payload: string
  fn: (name, event) => {
    // name is 'Johny', event is MouseEvent
    return { name, timestamp: event.timeStamp };
  },
  target: analyticsFx
});
```

If you don't provide a `source`, `fn` receives `(clock, clock)`. Redundant, but consistent.

#### 3.5 Avoiding Circular Dependencies

Since `sample` binds everything together, you might end up importing `Store A` into `Model B` and `Event B` into `Model A`.
Circular dependencies crash Metro bundlers and Webpack.

**The Fix:**
Keep your links **unidirectional**.
1.  **Events/Stores/Effects** definition at the top.
2.  **`sample`** calls at the bottom.

Better yet, use the **model** file structure we'll discuss in Chapter 6 (Factories). But for now, just remember: declare your units *before* you wire them.

---

### Chapter 4: Precision & Types

TypeScript is not just a linter; it is your contract. If your Effector code compiles but crashes at runtime because `undefined` slipped through, you failed.

Effector's type inference is generally world-class, but `sample` has a blind spot. It knows what comes *in*, but when you use `filter` to block data, TypeScript doesn't inherently know that the data coming *out* is now safer.

We need to fix this manually. We need **Precision**.

#### 4.1 The "Narrowing" Problem

Look at this scenario. You have a store that can be a User or `null`.

```typescript
interface User { id: string; name: string }
const $currentUser = createStore<User | null>(null);

const buttonClicked = createEvent();

sample({
  clock: buttonClicked,
  source: $currentUser,
  // Logic: Only proceed if user exists
  filter: (user) => user !== null,
  target: deleteUserFx
});
```

**The Compilation Error:**
TypeScript screams at `target: deleteUserFx`.
Why?
*   `$currentUser` is `User | null`.
*   `deleteUserFx` expects `User`.
*   TypeScript sees the `filter`, but for the `sample` return type, it is conservative. It thinks `null` might still pass through because a generic boolean function doesn't modify the *type* of its argument.

You are forcing a square peg (Maybe User) into a round hole (User).

#### 4.2 The Solution: Type Predicates (User-Defined Type Guards)

To shut TypeScript up *correctly*, we don't cast (`as User` is for cowards). We teach TypeScript about our filter logic using a **Type Predicate**.

A predicate is a function return type that looks like: `arg is Type`.

```typescript
// The Fix: Explicitly tell TS "If this returns true, 'user' is definitively 'User'"
sample({
  clock: buttonClicked,
  source: $currentUser,
  filter: (user): user is User => user !== null,
  target: deleteUserFx
});
```

Now the pipeline is green.
1.  Source is `User | null`.
2.  Filter proves it is `User`.
3.  Target receives `User`.
Precision achieved.

#### 4.3 `assert` Pattern for Invariants

Sometimes filtering isn't enough. Sometimes invalid state shouldn't just be ignored—it should raise an alarm because it represents a bug in your logic.

We can create a utility using `split` (more on that next chapter) or a dedicated thrower to catch "impossible" states.

```typescript
const doCriticalAction = createEvent();

sample({
  clock: doCriticalAction,
  source: $state,
  filter: (state) => !state.isValid,
  target: logErrorFx // Or some alert system
});
```

In robust systems, I prefer defining **Custom Guards**.

```typescript
import { not } from 'patronum';

sample({
  clock: submit,
  filter: not($isLoading), // Cleaner than arrows
  target: saveFx
});
```

Using `patronum` (the utility library we will cover in Chapter 7) keeps your samples clean and readable.

#### 4.4 Typing `createEffect`

Effects need clear contracts. Define the **Params**, the **Result**, and the **Error**.

```typescript
// createEffect<Params, Done, Fail>()
const fetchUserFx = createEffect<string, User, Error>(async (id) => {
  // ...
});
```

1.  **Params (`string`):** What goes in. `fetchUserFx('123')`.
2.  **Done (`User`):** The success payload. Types `.doneData`.
3.  **Fail (`Error`):** The rejection payload. Types `.failData`.

If you don't define the Error type, Effector defaults to `Error`, which is usually fine. But defining the Params and Result is mandatory for any public effect.

#### 4.5 The `Event` Transformation Trap

When you use `.map` on an event, TypeScript infers the new type automatically. This is usually good.
But sometimes, you want to decouple the types.

```typescript
const rawInputChanged = createEvent<string>();
// TS knows this is `number` now
const ageChanged = rawInputChanged.map(str => parseInt(str)); 
```

**The Trap:** If `rawInputChanged` emits "hello", `ageChanged` emits `NaN`. TypeScript says it's a `number`.
TypeScript lies. `NaN` is technically a number, but logically garbage.

**The Fix:** Validation logic should happen *before* state mapping.

```typescript
sample({
  clock: rawInputChanged,
  fn: parseInt,
  // Only allow valid numbers through
  filter: (n) => !Number.isNaN(n), 
  target: $age
});
```

Do not trust `.map` to handle runtime validity. `.map` is for shape changing, not validation. Use `sample` + `filter` for safety.

#### 4.6 Strict Null Checks

If your `tsconfig.json` does not have `"strictNullChecks": true`, Effector is useless to you. Effector relies on `null` and `undefined` being distinct types to manage flow correctly. If you are in a loose-mode codebase, fixing this config is your Step 0.

#### 4.7 The Type Inference Arsenal

You will often need to extract the type of a payload from a unit to type your component props or helper functions. Do not manually import types like `User`. Infer them from the source of truth—the Store.

Effector provides utility types. Use them.

```typescript
import { StoreValue, EventPayload, EffectResult } from 'effector';

// 1. Extracting State from a Store
type UserState = StoreValue<typeof $user>;

// 2. Extracting Params from an Event
type SubmitPayload = EventPayload<typeof submitForm>;

// 3. Extracting the Success Data from an Effect
type UserResponse = EffectResult<typeof fetchUserFx>;
```

**The "Read-Only" Interface Pattern:**
When exposing a model from a factory, you often want to prevent the consumer from triggering internal events. You want to expose `Event` (readonly), not `EventCallable`.

```typescript
// Inside Factory
const internalTick = createEvent();

return {
  // Consumer can watch this, but cannot fire it.
  tickOccurred: internalTick as Event<void> 
};
```

---

### Chapter 5: Routing Data

Linear logic is easy. "Button clicked -> Fetch Data" is kindergarten stuff.
Real enterprise logic branches. It forks. It loops. It converges.

> * User logs in. Is he an Admin? -> Go to Admin Dashboard.
> * User logs in. Is he a regular user? -> Go to Home Feed.
> * User logs in. Is his password expired? -> Go to Reset Password screen.

In legacy code, you solve this with a giant spaghetti `if/else` block inside a thunk or a watcher. In Effector, we treat logic flow like a railway system. We use **Switches** (`split`) and **Funnels** (`merge`).

#### 5.1 The Railway Switch: `split`

`split` allows you to take one event stream and divide it into multiple, mutually exclusive streams based on conditions.

There are two ways to use `split`. We will focus on the **declarative routing** variant, because it returns *events* that you can continue to use in your graph.

**Syntax:**
```typescript
import { split, createEvent } from 'effector';

const messageReceived = createEvent<Message>();

// Divide the stream
const { userMessage, sysMessage, errorMessage } = split(messageReceived, {
  userMessage: (msg) => msg.type === 'user',
  sysMessage: (msg) => msg.type === 'system',
  // Special key '__' acts as 'default' or 'else'
  errorMessage: (msg) => msg.type === 'error'
});
```

**The Architecture of `split`:**
You now have three new events: `userMessage`, `sysMessage`, and `errorMessage`.
When `messageReceived` fires, Effector runs the predicates. The *first* one that returns `true` "wins" the payload.
*   **Crucial Note:** By default, `split` is **exclusive**. Only *one* branch executes. (Unlike `sample` chains which can run in parallel).

**Use Case: The Authentication Router**

Instead of a generic `loginSuccess` that dumps the user anywhere, use logic to route them.

```typescript
// Define the output events (The Routes)
const toAdminPanel = createEvent();
const toUserFeed = createEvent();
const toOnboarding = createEvent();

// The Logic
split({
  source: loginFx.doneData, // The User object
  match: {
    admin: (user) => user.role === 'admin',
    newbie: (user) => user.loginCount === 0
  },
  cases: {
    admin: toAdminPanel,
    newbie: toOnboarding,
    __: toUserFeed // The Default
  }
});
```

Now your UI just listens to `toAdminPanel`, `toUserFeed`, etc. The logic is decoupled.

#### 5.2 The Funnel: `merge`

Sometimes you have the opposite problem. You have 10 different ways to close a modal.
1.  User clicks "X".
2.  User presses "Escape".
3.  The form submits successfully.
4.  The user clicks the overlay background.

You do not want to write 4 separate `sample` calls to `$modal.reinit`. You want to **merge** the intents.

**Syntax:**
```typescript
import { merge } from 'effector';

const closeClicked = createEvent();
const escapePressed = createEvent();
const formSaved = saveFx.done;

// The Funnel
const closeModal = merge([
  closeClicked,
  escapePressed,
  formSaved
]);

// Single logic point
$isOpen.reset(closeModal);
```

**Typing Warning:**
`merge` requires all input units to have compatible payloads. If one event triggers with `string` and another with `number`, `closeModal` will be `string | number`.
If the events don't match, map them to `void` first:

```typescript
const genericReset = merge([
  eventA.map(() => {}),
  eventB.map(() => {})
]);
```

#### 5.3 The Anti-Pattern: The God Store

I see this constantly in refactored Redux apps. You bring the "Single Store" mentality to Effector.

**The Horror:**
```typescript
// 🤮 BAD ARCHITECTURE
const $globalUI = createStore({
  isModalOpen: false,
  modalType: null,
  activeTab: 'home',
  sidebarExpanded: true,
  theme: 'dark'
});
```

Why is this bad?
1.  **Performance:** If I toggle the Sidebar, I re-trigger the checks for the Modal and the Tab. `useUnit` has to do more work (or use selectors).
2.  **Coupling:** The Sidebar Logic is now physically tied to the Modal Logic. You can't separate them into files easily.
3.  **Updates:** Updating a nested object is annoying (`...state, modal: ...`).

**The Solution: Atomicity & Combinatorics**

Break it down.
```typescript
const $isModalOpen = createStore(false);
const $modalType = createStore<ModalType | null>(null);
const $activeTab = createStore('home');
```

But what if you need a specific combination? What if the UI needs to know if "The Settings Modal is open"?
Do not create a flag store for this. **Derive it.**

```typescript
// Derived store (Computation only)
const $isSettingsOpen = combine(
  $isModalOpen,
  $modalType,
  (isOpen, type) => isOpen && type === 'settings'
);
```

This `$isSettingsOpen` is free. It updates automatically. It uses memory only when observed.

#### 5.4 Pattern: Complex Routing (Case Study)

Let's build a real-world pattern: **The "Wizard" Form.**
Step 1 -> Step 2 -> Step 3.

**Legacy approach:**
A component with `step` state.

**Kinetic approach:**
A `split` driven model.

**The Correct Way:**
Sample the state first, then split the data.

```typescript

// Get the current step when Next is clicked
split({
  clock: nextClicked,
  source: $currentStep,
  match: {
    toStep2: (step) => step === 1,
    toStep3: (step) => step === 2,
    submit:  (step) => step === 3
  },
  cases: {
    toStep2: targetStep2Fx, // side effects per step
    toStep3: targetStep3Fx,
    submit: submitWizardFx
  }
});
```

This is readable.
1. Event fires.
2. Logic reads state.
3. Switch routes the action.

---

## PART III: SCALABILITY & ABSTRACTION

### Chapter 6: The Factory Revolution

This is the tipping point.
Everything you read in Parts I and II allows you to build a *Singleton Application*. A simple dashboard where there is only one user, one set of posts, and one notification center.

But the enterprise is not a singleton.
*   You have **Multiple Popups** of the same type.
*   You have **Dynamic Forms** (adding lines to an invoice).
*   You have **Widgets** that appear multiple times on a dashboard.
*   You have **Lists of complex items** (e.g., a Feed where every Post has its own comment draft, like/unlike logic, and image carousel).

If you build these using global variables (`export const $postLike = ...`), you are doomed. Every Post component will subscribe to the *same* store. Liking one post will "like" all of them instantly.

You need instances. You need **Factories**.

#### 6.1 The "Global State" Trap vs. The Factory Pattern

**The Singleton (Wrong for Scalable UIs):**
```typescript
// feature/counter/model.ts
export const increment = createEvent();
export const $count = createStore(0).on(increment, c => c + 1);

// Inside React... <Counter />
// Uses the global export. Fine for ONE counter.
// Fails for 10 independent counters.
```

**The Factory (Correct):**
A Factory is simply a function that *returns* a set of connected units (a "Model").

```typescript
// feature/counter/factory.ts
import { createEvent, createStore } from 'effector';

// Use a Model interface to enforce consistency
interface CounterModel {
  increment: Event<void>;
  $count: Store<number>;
}

export function createCounterModel(initialValue: number = 0): CounterModel {
  const increment = createEvent();
  const $count = createStore(initialValue);
  
  // Wire internal logic locally!
  $count.on(increment, c => c + 1);

  // Return the interface
  return { increment, $count };
}
```

Now, every time you call `createCounterModel()`, you get a fresh, isolated universe of state and logic. No bleeding. No shared memory.

#### 6.2 The `modelFactory` from `@withease/factories`

Writing factory functions manually works, but it has pitfalls:
1.  **Serialization:** How do you send the state of *100 different instances* from Server to Client? SIDs are tricky here.
2.  **Context:** How does React know which specific instance of a model belongs to *this* component?

We use **`@withease/factories`** to solve this effortlessly. This library wraps the pattern and handles the plumbing.

```typescript
// features/timer/model.ts
import { createEvent, createStore } from 'effector';
import { modelFactory } from '@withease/factories';

// Wrap your creation logic in modelFactory
export const createTimerModel = modelFactory((startValue: number) => {
  const tick = createEvent();
  const reset = createEvent();
  
  const $seconds = createStore(startValue)
    .on(tick, s => s + 1)
    .reset(reset);

  return { 
    $seconds, 
    tick, 
    reset 
  };
});
```

#### 6.3 Consuming Factories in React: The Provider Pattern

So you have a factory. How do you use it in React? You can't just call it inside a component (it would recreate the store on every render).

You need to create the model **once** (stable reference) and provide it.

**Method A: Per-Component Scope (The `useModel` approach)**
This is ideal for widgets.

```typescript
// WidgetTimer.tsx
import { useModel } from '@withease/factories/react'; // Hypothetical clean hook or build your own
import { createTimerModel } from './model';

export const WidgetTimer = ({ start }: { start: number }) => {
  // Creates the model once per Mount.
  // cleans it up on Unmount automatically.
  const model = useModel(createTimerModel, start);
  
  const seconds = useUnit(model.$seconds);
  
  return <div>{seconds}</div>;
}
```

**Method B: List Virtualization (The dynamic list problem)**
Imagine a Feed with 100 Posts. Each Post is a complex model.

1.  **Parent Factory:** Holds the list of `ids`.
2.  **Item Factory:** Created dynamically for each item.

`@withease/factories` really shines here when combined with React Context, but let's look at the purely architectural view.

You usually don't need a heavy factory for every list item if the item logic is simple. But if it is complex (e.g., an invoice editor row with own validation), you do.

#### 6.4 Shared Instances (Singletons via Factories)

Wait, what if I *want* a singleton? What if I want a `SessionModel` that is unique for the whole app, but I still want to use the Factory pattern for consistency and testing?

You just invoke it at the root level!

```typescript
// app/models.ts
export const sessionModel = createSessionModel(); // Global Instance
```

Wait! **Don't do this if you need SSR.**
In SSR, "Global" means "Shared across all users on the server node." That is a security vulnerability (The Data Leak).

For SSR, even your "Singletons" must be created *inside* the Server Request Scope. We will tackle this deep topic in Chapter 14. But for now, know this: **Global Variables are banned in modern Effector architecture.** Everything must come from a Factory or be Scope-bound.

#### 6.5 Naming & Structure Standard

When building scalable apps, naming is key. Adhere to **Feature-Sliced Design (FSD)** naming inside your models.

**Structure of a `model.ts`:**
1.  **Inputs (Public API):** `clicked`, `submitted`, `propChanged`.
2.  **Outputs (Public API):** `$data`, `$status`.
3.  **Internals (Private):** Logic hidden inside the factory scope.
4.  **Exports:** Return an object. Do not export everything individually.

```typescript
export function createLoginForm() {
  // --- UNITS ---
  const submit = createEvent();
  const $username = createStore('');
  const $password = createStore('');
  
  // --- LOGIC ---
  const validateFx = createEffect(() => { ... });
  
  sample({
    clock: submit,
    source: { u: $username, p: $password },
    target: validateFx
  });

  // --- PUBLIC API ---
  return {
    submit,
    $username,
    $password,
    $isLoading: validateFx.pending,
    $error: createStore(null).on(validateFx.failData, (_, e) => e.message)
  };
}
```

The consumer only sees the returned object. The logic (`validateFx`, the `sample` wiring) is completely encapsulated. This is true Object-Oriented Programming (in the original message-passing sense) using Functional Reactive blocks.

#### 6.6 The Linkage Pattern (Cross-Model Communication)

We explained how to build isolated models. But how do two isolated models talk to each other without creating a "God Parent" or circular dependencies?

**The Pattern:**
Create a dedicated "Integration" file (e.g., `features/auth-to-profile.ts` or `app/links.ts`). Use `sample` to wire the *public output events* of one model to the *public input events* of another.

```typescript
// features/integrations.ts
import { sessionModel } from '@/features/session';
import { notificationsModel } from '@/features/notifications';

// Logic: When session expires, trigger a notification
sample({
  clock: sessionModel.sessionExpired,
  fn: () => ({ message: 'Session timed out', type: 'error' }),
  target: notificationsModel.showNotification
});
```

**Why:** This keeps `session` unaware of `notifications` and vice versa. The wiring logic lives in a neutral zone. This is the **Connector pattern** that keeps your domains loose.

---

### Chapter 7: Modularity via `patronum`

Stop. Put your hands behind your head and step away from the keyboard.

I know what you are thinking.
*"I need a debounce. I'll just write a quick wrapper with `setTimeout` inside an Effect."*
*"I need to check if ANY of these five requests are loading. I'll create a combine store and perform boolean algebra manually."*

**No.**

You are an architect, not a utility plumber. Every time you write a "helper" function, you introduce potential bugs, you introduce testing overhead, and you waste time.

The Effector ecosystem has a standard library for these patterns: **`patronum`**.
It is battle-tested. It creates proper nodes in the dependency graph. It handles cleanup automatically. Use it.

Here are the heavy hitters you will use in 90% of your factories.

#### 7.1 The Aggregate Loader: `pending`

**The Problem:** You have a "Save" button. It needs to be disabled if `saveUserFx` is running OR if `uploadAvatarFx` is running OR if the `reauthFx` background process is active.

**The Amateur Solution:**
```typescript
const $isBusy = combine(
  saveUserFx.pending,
  uploadAvatarFx.pending,
  reauthFx.pending,
  (a, b, c) => a || b || c
);
```

**The Patronum Solution:**
```typescript
import { pending } from 'patronum';

// Boolean store that is true if ANY of the provided effects are running.
const $isSaving = pending({
  effects: [saveUserFx, uploadAvatarFx, reauthFx],
  of: true // (Optional) can check specific domain/scope too
});
```
It’s clean. It reads like English. It handles the edge cases where an effect might be called multiple times.

#### 7.2 Finite State Machines: `status`

**The Problem:** "Boolean Soup".
You have `$isLoading`, `$hasError`, `$isSuccess`.
In your React component, you write:
`if (isLoading) ... else if (hasError) ... else if (isSuccess) ...`

What if `isLoading` and `isError` are both true due to a logic bug? You have an impossible state.

**The Patronum Solution:**
Treat async operations as a Finite State Machine (FSM). The `status` operator maps an effect (or store) to a simple string literal.

```typescript
import { status } from 'patronum';

const $saveStatus = status({ effect: saveFx });
// Value is strictly: "initial" | "pending" | "done" | "fail"
```

**Usage in UI (The Power Move):**
```tsx
const SaveButton = () => {
  const status = useUnit($saveStatus);

  switch (status) {
    case 'pending': return <Spinner />;
    case 'fail':    return <RetryButton />;
    case 'done':    return <SuccessCheckmark />;
    default:        return <Button>Save</Button>;
  }
}
```
You can no longer render the "Loading" spinner and the "Error" message simultaneously. The state space is mathematically constrained to valid values only.

#### 7.3 Flow Control: `debounce` & `delay`

Do not implement time-based logic using `setTimeout` in generic functions or watchers. Effector needs to know about the timer so it can clear it if the scope is destroyed (essential for SSR and testing).

**`debounce`:**
Waits for silence before triggering. Standard for search inputs.

```typescript
import { debounce } from 'patronum';

const searchInputChanged = createEvent<string>();

// Returns a new Event
const searchDebounced = debounce({
  source: searchInputChanged,
  timeout: 300
});

sample({
  clock: searchDebounced,
  target: searchApiFx
});
```

**`delay`:**
A hard wait. It holds the signal for X milliseconds, then releases it.

```typescript
import { delay } from 'patronum';

// Good for UX interactions, like keeping a notification on screen
const notificationShown = createEvent();

const hideNotification = delay({
  source: notificationShown,
  timeout: 5000
});

sample({
  clock: hideNotification,
  target: $notification.reinit
});
```

#### 7.4 Logic Forks: `condition`

While `split` (Chapter 5) is great for multi-routing, sometimes you just have a simple IF-THEN-ELSE scenario and `sample({ filter })` feels too verbose to write twice (once for true, once for false).

`condition` is the concise syntax for binary forks.

```typescript
import { condition } from 'patronum';

condition({
  source: formSubmitted,
  if: $isFormValid, // Predicate (Store or Fn)
  then: saveFx,     // Execute if true
  else: showErrorFx // Execute if false
});
```
It replaces two `sample` calls. Use it for readability.

#### 7.5 Object Mapping: `spread`

**The Problem:** You receive a big object payload (e.g., from a form initialization or a URL query), and you need to push distinct fields into distinct atomic stores.

**The Amateur Solution:**
A massive watcher or separate `.on` handlers.
```typescript
const $name = createStore('');
const $age = createStore(0);
// Manual wiring... repetitive
$name.on(initEvent, (_, payload) => payload.name);
$age.on(initEvent, (_, payload) => payload.age);
```

**The Patronum Solution:**
`spread` takes a source object and distributes its properties to targets.

```typescript
import { spread } from 'patronum';

const formInit = createEvent<{ name: string; age: number }>();

sample({
  clock: formInit,
  target: spread({
    targets: {
      name: $name,
      age: $age
    }
  })
});
```
This operator effectively performs "Destructuring Assignment" into stores. It ensures all stores update in the same tick.

#### 7.6 Logical Gates: `and`, `not`

Sometimes you need to compose boolean filters for a `sample`.
Patronum provides `and` / `or` / `not` operators that work on Stores directly.

```typescript
import { not, and } from 'patronum';

sample({
  clock: submitClicked,
  // Only submit if user is logged in AND not currently loading
  filter: and($isLoggedIn, not($isLoading)), 
  target: submitFx
});
```
This is significantly cleaner than:
`filter: combine($isLoggedIn, $isLoading, (auth, load) => auth && !load)`

#### 7.7 The Atomic Barrier: `combineEvents`

**The Problem:** You have a transaction that requires multiple independent user actions to complete, and the order doesn't matter, but **all** actions must happen *fresh* for every transaction.
*   Example: To send a secure payment, the user must click "Send" AND verify a Biometric check.
*   Example: To submit a protected form, the user must click "Submit" AND solve a Captcha.

**The Amateur Solution:**
Boilerplate stores (`$isClicked`, `$isVerified`) that you have to manually reset to `false` after every submission.

**The Patronum Solution:**
`combineEvents` collects one occurrence of each event. Once the set is complete, it fires and **resets**.

```typescript
import { combineEvents } from 'patronum';

const submitClicked = createEvent();
const captchaVerified = createEvent<string>();

// The Barrier
const authorizedSubmission = combineEvents({
  events: {
    submission: submitClicked,
    token: captchaVerified
  }
});

sample({
  clock: authorizedSubmission,
  target: sendDataFx
});
```

**Architectural Behavior (The "Lock-Step" Rule):**
Unlike `combine` or `sample`, this operator does not hold state.
1.  User clicks Submit. (Waiting for Captcha...)
2.  User solves Captcha. -> **Barrier Fails. `authorizedSubmission` fires.**
3.  User clicks Submit again. -> **Nothing happens.** (Waiting for Captcha...)

It forces **all** participants to trigger again before the target fires again. It guarantees that a stale Captcha token (from the previous run) is never reused for a new Submit click.

---

## PART IV: THE INFRASTRUCTURE (ECOSYSTEM)

### Chapter 8: Advanced Networking with `farfetched`

So you have `createEffect`. You think you're done. You write an async function, call `fetch`, and return JSON.

Congratulations, you have built a toy.

In the real world, the Network is your enemy.
*   **The user clicks twice.** Do you send two requests? Do you race them? Do you cancel the first one?
*   **The user switches tabs.** The data is stale. Do you refresh it automatically?
*   **The component mounts twice.** Do you ignore the second request if the first is running (deduplication)?
*   **The backend lies.** It says it returns a string, but sends `null`. Your app crashes.

If you solve these problems manually inside `createEffect`, you are writing your own `React Query`. Stop it. Effector has **`farfetched`**. It is the heavy artillery of data synchronization.

#### 8.1 The Mental Model: Remote State

`farfetched` introduces two concepts borrowed from the modern data-fetching zeitgeist (like TanStack Query) but integrated deeply into the Effector graph:
1.  **Queries:** For **reading** data. (Idempotent, cacheable).
2.  **Mutations:** For **writing** data. (Side-effects, cache breakers).

This is not just "calling an API." This is synchronizing a remote database with your local graph.

#### 8.2 The Query: `createQuery`

Stop manually creating `$users`, `$usersLoading`, `$usersError` and a `fetchUsersFx` to populate them. `createQuery` generates this entire subgraph for you.

```typescript
import { createQuery } from '@farfetched/core';
import { contract } from '@farfetched/zod'; // Optional: schema validation
import { z } from 'zod';

const UserSchema = z.object({ id: z.string(), name: z.string() });

export const usersQuery = createQuery({
  // The Name (for Debugging)
  name: 'usersQuery',
  
  // The Handler: Pure async logic
  handler: async (limit: number) => {
    const res = await api.get(`/users?limit=${limit}`);
    return res.data;
  },

  // The Contract: TRUST NO ONE.
  // Validate the response shape. If it fails, the Query fails.
  contract: contract(z.array(UserSchema)),

  // The Params mapping (Optional: maps generic trigger data to handler args)
  mapData: (sourcePayload) => sourcePayload.limit,
});
```

**What you get for free:**
*   `usersQuery.start(params)`: The event to trigger the fetch.
*   `usersQuery.$data`: The store holding the last successful result.
*   `usersQuery.$pending`: The boolean loader.
*   `usersQuery.$error`: The error state (including validation errors).
*   `usersQuery.reset`: Clear everything.

**Race Condition Handling:**
By default, `farfetched` handles the "ABA problem". If you request with params A, then B, and A returns *after* B, `farfetched` ignores the stale A response. You don't write logic for this. It just works.

#### 8.3 Reactivity & Caching

The true power is how you trigger it. You don't call it inside `useEffect`. You connect it to the graph.

```typescript
// Start the query when the Page Gate opens (Route matched)
sample({
  clock: UsersPageGate.open,
  fn: () => ({ limit: 10 }),
  target: usersQuery.start
});

// Stale-While-Revalidate pattern? Easy.
const usersQuery = createQuery({
  // ... configuration ...
  staleAfter: '5m' // 5 minutes
});
```
When `usersQuery.start` is called, `farfetched` checks its internal cache.
*   If data is fresh: Do nothing (or return cache).
*   If data is stale: Fetch in background, update `$data`.

#### 8.4 The Contract: Defensive Coding

I want to re-emphasize the `contract` field. This is something `React Query` generally leaves up to you. In `farfetched`, it's a first-class citizen.

If your API changes the schema and sends a string instead of an array, a raw `fetch` call might break inside your component rendering. `farfetched` catches this at the network layer. The query moves to the `failure` state with a `ContractError`. Your UI shows an error message instead of crashing with `Cannot map undefined`.

This makes your frontend **bulletproof** against backend regressions.

#### 8.5 Mutations & Cache Invalidation

You display a list of users. You delete one. The list is now wrong.
You need a **Mutation**.

```typescript
import { createMutation } from '@farfetched/core';

export const deleteUserMutation = createMutation({
  handler: async (id: string) => {
    await api.delete(`/users/${id}`);
  }
});
```

Now, link the Mutation to the Query using `update` rules.

```typescript
import { update } from '@farfetched/core';

update(usersQuery, {
  on: deleteUserMutation,
  by: {
    success: ({ query, mutation }) => {
      // Optimistic update?
      if (!query) return { result: [] }; // Handle empty state
      
      // Filter out the deleted user from the query cache immediately
      return {
        result: query.result.filter(u => u.id !== mutation.params)
      };
    }
  }
});
```

Or, the simpler "Brute Force" approach: Refetch the world.

```typescript
sample({
  clock: deleteUserMutation.finished.success,
  target: usersQuery.start // Re-trigger the fetch
});
```

#### 8.6 Concurrency Control

Race conditions aren't just about stale data; they are about bandwidth and resource management.
*   **Search:** If I type "Hello", I don't want to send requests for "H", "He", "Hel", "Hell". I want to cancel the previous ones.
*   **Mutations:** If I click "Save" twice rapidly, I don't want two POST requests.

`farfetched` has a dedicated operator for this: **`concurrency`**.

```typescript
import { concurrency } from '@farfetched/core';

// Search: Automatically cancels previous in-flight requests
concurrency(searchQuery, { strategy: 'TAKE_LATEST' });

// Mutations: Ignores clicks while one is already running
concurrency(saveMutation, { strategy: 'TAKE_FIRST' });
```
This replaces complex `sample` logic involving `pending` stores and guards. It is declarative traffic control.

#### 8.7 Using it in React

Because `createQuery` produces standard Stores and Events, you consume it exactly like any other Effector model.

```tsx
const UserList = () => {
  // Extracting data via useUnit
  const { data, pending, start } = useUnit(usersQuery);

  if (pending && !data) return <Skeleton />;
  
  return (
    <ul>
      {data?.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
};
```

#### 8.8 Integration with Factories

When using factories (Chapter 6), `farfetched` fits perfectly. You create the query *inside* the factory.

```typescript
// feature/user/model.ts
export const createActiveUsersModel = modelFactory(() => {
  const query = createQuery({ ... });

  // ... wiring ...

  return { 
    $users: query.$data, 
    $isLoading: query.$pending,
    refresh: query.start
  };
});
```
This ensures every instance of your widget has its own independent data fetching pipeline, deduplicated locally.

#### 8.9 The "Time Travel" Pattern (Optimistic Updates)

Users hate waiting. If they click "Like", the heart should turn red *instantly*. If the server fails 500ms later, it should turn back to grey and show an error.

This is **Optimistic UI**. In `farfetched`, you implement this by manipulating the cache manually via `update`.

```typescript
// 1. The Mutation
const likePostMutation = createMutation({
  handler: (postId) => api.like(postId)
});

// 2. The Optimistic Update
update(postQuery, {
  on: likePostMutation.start, // Trigger on START, not success
  by: {
    success: ({ query, mutation }) => {
      // Current state
      const post = query.result;
      
      // Return the "Future" state
      return {
        result: {
          ...post,
          liked: true,
          likesCount: post.likesCount + 1
        }
      };
    }
  }
});

// 3. The Rollback (If it fails)
update(postQuery, {
  on: likePostMutation.finished.failure,
  by: {
    success: ({ query }) => {
      // Force a refetch to get the true server state
      // OR manually revert the math if you are brave
      return {
        refetch: true 
      };
    }
  }
});
```

This creates a UI that feels instantaneous but remains eventually consistent.

---

### Chapter 9: Routing as State with `atomic-router`

Most frontend developers have "Component Brain." They think a URL change is something that happens inside the React tree. They use `<Link>` components, they use `useNavigate`, they put data fetching inside `useEffect` triggered by `useParams`.

**This is structural weakness.**

If your data fetching depends on a React component mounting, you are already too late. You are creating waterfalls. You are coupling your business logic to a specific rendering engine.

In the Effector Playbook, **The URL is just another Store.** It is the source of truth for "Where are we?" and "What is the context?". It drives the application, not the View.

We use **`atomic-router`**. It decouples the router from React. It allows you to trigger logic *before* the View even knows the page has changed.

#### 9.1 The Philosophy: Routes as Units

In `react-router`, a route is a generic concept hidden inside JSX.
In `atomic-router`, a route is an explicit **Unit** created in your model files.

```typescript
// shared/routes.ts
import { createRoute } from 'atomic-router';

export const homeRoute = createRoute();
export const profileRoute = createRoute<{ userId: string }>(); // Typed params!
export const settingsRoute = createRoute();
```

These routes exist independently of the UI. You can import `profileRoute` in your analytics module, your auth module, and your user module without importing a single React component.

#### 9.2 The Setup: Mapping Logic

You connect these routes to the browser's history API using a router instance.

```typescript
// app/router.ts
import { createHistoryRouter } from 'atomic-router';
import { createBrowserHistory } from 'history';
import { homeRoute, profileRoute, settingsRoute } from '@/shared/routes';

export const routesMap = [
  { path: '/', route: homeRoute },
  { path: '/user/:userId', route: profileRoute },
  { path: '/settings', route: settingsRoute },
];

export const router = createHistoryRouter({
  routes: routesMap,
});

// Create the history object (Abstracted for Testing/SSR later)
const history = createBrowserHistory();

// Bind it
router.setHistory(history);
```

#### 9.3 Triggering Logic: `opened` vs `mounted`

This is where we crush the standard React pattern.
Don't fetch data when the component mounts. Fetch data when the **Route Opens**.

Every route object has lifecycle events:
*   `route.opened`: Fires when entering the route (or page reload). **The primary trigger.**
*   `route.updated`: Fires when params change (e.g., `/user/1` to `/user/2`).
*   `route.$params`: A store containing the current parameters.
*   `route.$query`: A store containing `?search=xyz`.

**The Kinetic Pattern:**

```typescript
import { profileRoute } from '@/shared/routes';
import { fetchUserProfileFx } from '@/features/user';

// When the profile route opens, take the ID and fetch.
sample({
  clock: profileRoute.opened,
  fn: ({ params }) => params.userId,
  target: fetchUserProfileFx
});
```

The component for the Profile Page might not even be lazy-loaded yet. But the network request is already flying. This is how you achieve instant UI performance.

#### 9.4 Route Guards: The Redirect Pattern

You have a `Settings` page. It requires the user to be logged in.
Do not complicate your life with `chainRoute` unless you need to block the route transition entirely (waiting for async auth). For 90% of cases, you just need a reactive **Redirect**.

1.  Listen for the Route Opened event.
2.  Check the condition.
3.  Target another Route's open event.

```typescript
import { redirect } from 'atomic-router'; // or just sample
import { settingsRoute, loginRoute } from '@/shared/routes';
import { $isAuthenticated } from '@/features/session';

// The "Bouncer" Logic
redirect({
  clock: settingsRoute.opened,
  filter: (isAuth) => !isAuth,
  source: $isAuthenticated, 
  route: loginRoute
});
```

If you don't use the `redirect` helper, a simple `sample` works too:

```typescript
sample({
  clock: settingsRoute.opened,
  source: $isAuthenticated,
  filter: (isAuth) => !isAuth,
  target: loginRoute.open
});
```

This keeps the logic visible in the graph. The user tries to enter -> The Logic checks credential -> The Logic redirects.

#### 9.5 Navigation as a Side Effect

You do not use `<Link>` for everything. Sometimes you need to navigate programmatically after an action completes (e.g., Form Submission success).

Use the router's units as targets.

```typescript
// Navigating programmatically
sample({
  clock: loginForm.submitted,
  target: loginFx
});

sample({
  clock: loginFx.done,
  // target can be a Route! It has an .open method (Unit)
  target: homeRoute.open 
});
```

You can also use the low-level `router.push` or `router.replace` as effects if you need to construct URLs manually, but targeting `route.open` is safer because it enforces type-checking on params.

```typescript
// Pass params correctly
sample({
  clock: userSelected, // payload: { id: 'u1' }
  fn: (user) => ({ userId: user.id }),
  target: profileRoute.open
});
```

#### 9.6 Synchronization with React

Finally, you need the View to reflect the Store. `atomic-router-react` provides the link.

```tsx
import { RouterProvider, Route } from 'atomic-router-react';
import { router } from '@/app/router';

const App = () => (
  <RouterProvider router={router}>
    <Layout>
      {/* Route handles strict rendering logic */}
      <Route route={homeRoute} view={HomePage} />
      <Route route={profileRoute} view={ProfilePage} />
      <Route route={settingsRoute} view={SettingsPage} />
    </Layout>
  </RouterProvider>
);
```

`atomic-router` waits for the route to be settled. It handles browser back/forward buttons automatically by syncing the history to the `router` stores.

#### 9.7 Query Params

Managing URL query parameters (`?search=foo&filter=active`) is notoriously painful in vanilla React.
In `atomic-router`, it's just a reactive mapping.

```typescript
// Read
sample({
  clock: usersRoute.updated,
  source: usersRoute.$query,
  fn: (query) => query.search ?? '',
  target: searchModel.$searchTerm
});

// Write (Control Protocol)
// When the internal store changes, update the URL (keep synced)
import { controls } from 'atomic-router';

// This is complex. Atomic-router offers utilities for 2-way sync
// but often just a simple sample to router.push is better.

sample({
  clock: searchModel.$searchTerm,
  source: usersRoute.$params,
  fn: (params, search) => ({
    params,
    query: { search }
  }),
  target: usersRoute.open // Pushes new state
});
```
*Architecture Tip:* Treat the URL as the **Source of Truth** for filters. If the user changes a filter in the UI, update the URL. Then let the `route.updated` event trigger the `farfetched` query. Do not do both. Unidirectional Flow: `UI -> URL -> Store -> Fetch`.

---

### Chapter 10: Syncing Reality

Your application does not float in a void. It exists in a browser. A messy, unstable, resource-constrained environment where the user can close the tab, lose Wi-Fi, or switch focus to Netflix at any moment.

Standard Effector is memory-only. When you refresh, everything dies.
To build a resilient app, we need to pierce the veil between the "Pure Graph" and the "Dirty Reality."

We will use **`effector-storage`** for persistence, **`@withease/web-api`** for browser sensors, and **`effector-hotkey`** for keyboard control.

#### 10.1 Persistence with `effector-storage`

Manually writing `localStorage.setItem` inside an Effect and `JSON.parse(localStorage.getItem)` at startup is error-prone. It introduces hydration mismatches during SSR and sync issues across tabs.

`effector-storage` is the synchronization engine. It binds a Store to a storage medium (Local, Session, Async).

**The Basic Bind:**
```typescript
import { persist } from 'effector-storage/local';

const $theme = createStore<'light' | 'dark'>('light');

// Magic: automatically hydrates on start, updates storage on change.
persist({
  store: $theme,
  key: 'ui-theme'
});
```
When your app boots, `$theme` will implicitly initialize with "dark" if that’s what was in `localStorage`. You don't need `createEvent` or `appStarted` triggers. It is transparent.

**Advanced Sync (Adapters):**
Sometimes you don't want strictly LocalStorage. Maybe you want URL State synchronization (if not using router for it), or you have a custom Async Storage (React Native).

```typescript
import { persist } from 'effector-storage/rn/async'; // React Native support

persist({
  store: $authToken,
  key: 'auth_token',
  serialize: (t) => t, // Optional raw
  deserialize: (s) => s
});
```

**Architectural Warning (The Hydration Flash):**
In Next.js App Router (RSC), `effector-storage` typically runs on the client. If your HTML comes from the server with "Light Mode" (default) but LocalStorage has "Dark Mode", you will get a React hydration mismatch error ("Text content does not match").

**The Fix:**
1.  **Lazy Components:** Wrap the part of the UI dependent on persistent state in a component that only renders after mount (`ClientOnly`).
2.  **`skipHydration`:** Use an adapter that supports skipping the initial hydration tick, or simply accept that persistent UI preferences are a client-side enhancement.

#### 10.2 Sensing the World: `@withease/web-api`

Do not write `window.addEventListener('online')`.
These events are global side effects. They need to be Units in your graph so you can `sample` them.

`@withease/web-api` wraps the DOM APIs into reactive Stores and Events.

**Network Status:**
Stop showing a "Save" button if the user is offline.
```typescript
import { network } from '@withease/web-api';

const $isOnline = network.$online; // Store<boolean>

// Usage: Disable mutations instantly
sample({
  clock: savePressed,
  filter: $isOnline, // Only allow if online
  target: saveFx
});

// Or, reactive UI blocking
const $isOffline = $isOnline.map(x => !x);
```

**Tab Visibility (The "Welcome Back" Refresh):**
If the user left your tab for 30 minutes, your data is garbage. When they return, you should silently refresh.

```typescript
import { visibility } from '@withease/web-api';

// Create a trigger for "User just came back"
const userReturned = sample({
  clock: visibility.visible,
  filter: visibility.$visible
});

// Refresh the main feed
sample({
  clock: userReturned,
  target: mainFeedQuery.start
});
```

**Page Lifecycle (BeforeUnload):**
Prevent the user from closing the tab if they have unsaved changes.

```typescript
import { page } from '@withease/web-api';

// Sync unsaved changes boolean to the warning
sample({
  source: $hasUnsavedChanges,
  target: page.$preventUnload
});
```
It is elegant. No imperative `window.onbeforeunload = ...`.

#### 10.3 Keyboard Control: `effector-hotkey`

Shortcuts are not an "Easter Egg" feature for power users. They are a productivity requirement.
Handling `document.addEventListener('keydown')` is a nightmare of key codes, modifiers, and conflicting handlers.

Use **`effector-hotkey`**.

**Binding Keys to Events:**
```typescript
import { hotkey } from 'effector-hotkey';

const savePressed = createEvent();

// Connect CTRL+S / CMD+S to the event
hotkey({
  key: 'mod+s',
  target: savePressed,
  preventDefault: true // Stop browser 'Save Page As'
});

// Complex combinations
hotkey({
  key: 'shift+n',
  target: newItemCreated
});
```

**Scope-Aware Hotkeys:**
Hotkeys often depend on context. "Enter" submits the form *only* if the Modal is open.

```typescript
hotkey({
  key: 'Enter',
  filter: $isModalOpen,
  target: submitModalFx
});
```
This clean declarative mapping makes your "Input Layer" visible. You can see all shortcuts in one file (or co-located with their features), rather than burying them in component lifecycle methods.

#### 10.4 The "System Gate" Pattern

Often, we want these integrations to start only when the App is "Ready" or "mounted."
We can wrap these logic bindings in a **Gate** or a specialized initializer model.

```typescript
// features/system/init.ts
export const appStarted = createEvent();

sample({
  clock: appStarted,
  target: [
    // Setup listeners, initial fetches, etc.
  ]
});

// Link global listeners to internal logic
persist({ store: $userSettings, key: 'settings' });

hotkey({ key: 'F1', target: showHelp });
```

---

### Chapter 11: Polyglot Apps

You think English is the default? In 2026, if your app doesn't speak the user's language, it's trash.

Most React developers solve this with `react-i18next` and the `useTranslation` hook.
**That is not enough.**

Hooks only exist inside the View. But what happens when your **Logic** needs to generate a text?
*   What if a backend error needs to be mapped to a user-friendly message *before* it's stored in `$errorMessage`?
*   What if you need to update the `document.title` dynamically based on the current page and state?
*   What if you send a notification via a pure function?

You cannot call `useTranslation` inside `sample`. You need the translation engine available in the Graph.
We use **`@withease/i18next`**.

#### 11.1 The Bridge

This library connects the standard `i18next` instance to Effector stores. It gives you reactive access to the translator function (`t`) and the current language.

**Setup:**
Do not reinvent the wheel. Initialize standard `i18next` and pass it to the integration.

```typescript
// shared/i18n.ts
import i18next from 'i18next';
import { createI18n } from '@withease/i18next';

// 1. Setup standard instance
const i18nInstance = i18next.createInstance();
i18nInstance.init({
  resources: { ... },
  lng: 'en',
  fallbackLng: 'en',
});

// 2. Bind to Effector
export const i18n = createI18n(i18nInstance);
```

Now you have `i18n.$t` and `i18n.$language` available as units.

#### 11.2 Translating inside Logic

This is the killer feature. You want to store a human-readable error message, but the error came from an Effect, and you need to translate it immediately based on the *current* language.

**The Logic Translation Pattern:**

```typescript
import { i18n } from '@/shared/i18n';
import { showErrorFx } from '@/shared/notifications';

// Handle API failures
sample({
  clock: saveUserFx.failData, // Error object
  source: i18n.$t,            // The translation function
  fn: (t, error) => {
    // Map error code to translation key
    // "error.404" -> "User not found"
    return t(`errors.${error.code}`, { defaultValue: t('errors.unknown') });
  },
  target: showErrorFx // Calls the toaster with a localized string
});
```

The `$t` store updates whenever the language changes. If the user switches language, the *next* sample will use the new language automatically.

#### 11.3 Dynamic Titles and Meta

Stop using `react-helmet` inside your components. It splits your logic.
Combine your Page Route, your Data, and your Language to produce the Title.

```typescript
const $pageTitle = combine(
  profileRoute.$params,
  $userProfile,
  i18n.$t,
  (params, user, t) => {
    if (!user) return t('pages.profile.loading');
    return t('pages.profile.title', { name: user.name });
  }
);

// Bind to document title (using @withease/web-api or custom effect)
sample({
  source: $pageTitle,
  target: updateTitleFx
});
```

#### 11.4 Switching Languages

Do not import `i18next` directly in your UI switchers. Use the wrapper's API to ensure the Effector graph stays in sync.

```typescript
// In your language switcher UI
const { changeLanguage } = useUnit({
  changeLanguage: i18n.changeLanguageFx
});

// usage
<button onClick={() => changeLanguage('es')}>ES</button>
```

#### 11.5 React integration

Inside your components, you *can* use the generated `$t` store via `useUnit`, but frankly, for pure static rendering (labels on buttons), the standard `useTranslation` hook from `react-i18next` is often more optimized for VDOM updates (Suspense support, etc.).

**Recommendation:**
*   **Logic / Toasts / Titles:** Use `@withease/i18next` (`$t` in sample).
*   **Static JSX Text:** Use `useTranslation` (Standard React).

Do not be a purist. Use the right tool for the layer. If the text lives in the Graph (Stores), use `@withease`. If the text lives in the DOM (JSX), use React.

---

## PART V: THE INTERFACE (REACT INTEGRATION)

### Chapter 12: The View Layer

Welcome to the dumbest part of your application.

I mean that as a compliment.
Your View Layer (React components) should be **dumb**. It should not think. It should not fetch. It should not calculate.
It has one job: **Take the State from Effector and paint it on the screen.**

If you have `useEffect`, `useState`, or heavy `useMemo` in your business components, you are violating the Separation of Concerns. You are leaking logic into the view.

In this chapter, we master `effector-react`. We stop fighting React's render cycle and start controlling it.

#### 12.1 `useUnit`: The Universal Connector

Forget `useStore`. Forget `useEvent`. Forget manual subscriptions.
Since Effector 23, there is only one hook you need to know: **`useUnit`**.

It binds your component to the Scope (for SSR compatibility) and extracts the values you need.

**Syntax:**
```tsx
import { useUnit } from 'effector-react';
import { $user, submitClicked, loginFx } from './model';

const UserProfile = () => {
  // Pass an object of units. Get an object of values/functions.
  const { user, onSubmit, isLoading } = useUnit({
    user: $user,
    onSubmit: submitClicked,
    isLoading: loginFx.pending
  });

  return (
    <div className={isLoading ? 'loading' : ''}>
      <h1>{user?.name}</h1>
      <button onClick={() => onSubmit()}>Save</button>
    </div>
  );
};
```

**Why this works:**
1.  **Batching:** It subscribes to updates. If `isLoading` and `user` update in the same tick, React renders **once**.
2.  **Scope Binding:** This is critical. The `onSubmit` function returned by `useUnit` is bound to the current Scope (Server Request or Test). If you just imported `submitClicked` directly and called it, you would break SSR/Testing isolation. **ALWAYS call events via `useUnit`.**
3.  **Ref Stability:** The functions (`onSubmit`) remain referentially stable across renders, so `memo` components below don't re-render unnecessarily.

#### 12.2 The List Problem: `useList`

React is notoriously bad at rendering large lists. If you use standard `.map()`:

```tsx
// 🐌 SLOW
const items = useUnit($items); // Array<Item>
return (
  <div>
    {items.map(item => <Row key={item.id} item={item} />)}
  </div>
);
```
Every time *one* item changes (e.g., `item[5].active` becomes `true`), the `$items` store reference changes (immutability). `useUnit` forces the *Parent Component* to re-render. React then has to diff the entire list.

**The Kinetic Solution: `useList`**

`useList` tells Effector to manage the DOM list directly. It memoizes the updates. The Parent component does *not* re-render when a child changes.

```tsx
import { useList } from 'effector-react';

const ItemList = () => {
  return useList($items, (item, index) => (
    // Only THIS callback runs for the updated item
    <div className="row">
      {item.name}
    </div>
  ), { keys: [/* optional deps */] });
};
```

**Optimization Level 2:**
If your items are complex, combine `useList` with specific atomic queries inside the child.

```tsx
// Use IDs in the list
const ItemList = () => {
  return useList($itemIds, (id) => <ComplexRow id={id} />);
}

// Subscribe to specific item data in the child
const ComplexRow = ({ id }: { id: string }) => {
  const item = useUnit($itemsDictionary); 
  // ... this is still suboptimal. See next section.
};
```

#### 12.3 Fine-Grained Selection: `useStoreMap`

In the example above, if `ComplexRow` subscribes to the whole `$itemsDictionary`, every row re-renders when *any* row updates.
We need to subscribe strictly to `state[id]`.

Use **`useStoreMap`**. It runs a selector and *only* triggers a re-render if the *result* of that selector changes.

```tsx
import { useStoreMap } from 'effector-react';

const ComplexRow = ({ id }: { id: string }) => {
  // Selector logic inside the component (optimized)
  const item = useStoreMap({
    store: $itemsDictionary,
    keys: [id], // If 'id' prop changes, re-run selector
    fn: (items, [id]) => items[id]
  });

  return <div>{item.name}</div>;
};
```

**The New Way (Model Factory):**
If using Factories (Chapter 6), you don't even need `useStoreMap`. You pass the *instance store* to the component.

```tsx
// With factories, each row has its own isolated store.
const Row = ({ model }: { model: ItemModel }) => {
  const isSelected = useUnit(model.$isSelected); // Zero leakage
  return ...
}
```
This is the ultimate performance pattern.

#### 12.4 React 18 Concurrent Features

Effector is fully compatible with React 18's concurrency.
Because Effector state lives *outside* React, it needs to sync carefully. `useUnit` uses `useSyncExternalStore` under the hood. This guarantees no "tearing" (visual inconsistencies) during concurrent rendering transitions.

You don't need to do anything. It just works.

#### 12.5 The "No-Logic" Rule (Strict Strictness)

I want you to look at your component.
Does it have a `useEffect`?
Does it have a `useCallback` that calculates data?

**Delete them.**

*   **Problem:** "I need to fetch data when the user changes the filter dropdown."
*   **React-Brain:**
    ```tsx
    // 🤮 TRASH
    useEffect(() => {
       fetch(filter);
    }, [filter]);
    ```
*   **Kinetic-Brain:**
    *   The `onChange` of the dropdown triggers an Event (`filterChanged`).
    *   The Logic Graph handles the rest: `sample({ clock: filterChanged, target: fetchFx })`.
    *   The component simply renders the `<select>` and binds `onChange`.

```tsx
// 💎 DIAMOND
const Filter = () => {
  const { filter, onFilterChange } = useUnit({ 
    filter: $filter, 
    onFilterChange: filterChanged 
  });

  return (
    <select value={filter} onChange={e => onFilterChange(e.target.value)} />
  );
};
```

This component is now purely representational. You can test the fetching logic without rendering the component. You can swap the UI library without rewriting the fetch logic.

#### 12.6 The Gate Pattern (Mounting Logic)

I told you to delete `useEffect`. But sometimes you *need* a signal that says "This component has appeared on the screen."

Effector provides **`createGate`** (via `effector-react`).
A Gate is a component that acts as a bridge between React lifecycle and Effector events.

**Syntax:**
```typescript
import { createGate } from 'effector-react';

// Define the Gate in the Model
export const ProfileGate = createGate<{ id: string }>();

// Use the Gate in the View
const ProfilePage = ({ id }) => {
  useGate(ProfileGate, { id });
  return <div>...</div>;
};
```

**Wiring the Logic:**
Now you have specific events for mounting/unmounting and props updates.

```typescript
// In model.ts
sample({
  clock: ProfileGate.open, // Component Mounted
  target: fetchProfileFx
});

sample({
  clock: ProfileGate.state, // Props changed (id changed)
  target: fetchProfileFx
});

sample({
  clock: ProfileGate.close, // Component Unmounted
  target: clearProfileStore
});
```

**Why is this better than `useEffect`?**
1.  **Testability:** You can trigger `ProfileGate.open()` in a test environment without rendering React.
2.  **Separation:** The View doesn't know *what* happens on mount. It just reports *that* it mounted.

---

### Chapter 13: Fine-Grained Binding with `@effector/reflect`

I hate boilerplate.
Writing `const { prop } = useUnit($store)` inside every component is cleaner than `useEffect`, but it is still repetitive manual labor. It forces your component to "know" about the specific Effector store it consumes.

This makes your UI components harder to reuse in Storybook. You have to mock the store to test the view.

We can decouple them completely. We can make your UI components 100% pure "Dumb" components that only take Props, and use **`@effector/reflect`** to glue the Logic to the View from the outside.

#### 13.1 The "Bind" Philosophy

Imagine a `<Button>` component. It expects `onClick` and `disabled`.
You have `$isFormInvalid` store and a `submit` event.

**The Hook Way (Coupled):**
```tsx
const SubmitButton = () => {
  const { submit, invalid } = useUnit({ 
    submit: submitForm, 
    invalid: $isFormInvalid 
  });
  
  return <Button onClick={submit} disabled={invalid}>Save</Button>;
}
```

**The Reflect Way (Decoupled):**
You take the generic `<Button>`, and you **reflect** the state onto it.

```tsx
import { reflect } from '@effector/reflect';
import { Button } from '@/ui/kit'; // Pure generic UI

export const SubmitButton = reflect({
  view: Button,
  bind: {
    onClick: submitForm,
    disabled: $isFormInvalid,
    children: 'Save' // Static props work too
  }
});
```

`SubmitButton` is now a fully formed React component. It subscribes to `$isFormInvalid`. When the store updates, it re-renders. But `<Button>` inside stays pure.

#### 13.2 Conditional Views: `variant`

React code is often littered with `if (loading) return <Spinner />`.
This logic is visually noisy.

`@effector/reflect` gives you `variant`. It’s a declarative `switch` statement for components. Remember the `status` pattern from Chapter 7? This is its UI partner.

```tsx
import { variant } from '@effector/reflect';
import { $submissionStatus } from './model';

export const StatusIcon = variant({
  source: $submissionStatus, // "pending" | "done" | "fail" | "initial"
  cases: {
    pending: () => <Spinner size="sm" />,
    fail: () => <Icon name="error" color="red" />,
    done: () => <Icon name="check" color="green" />,
    // Default fallback
    default: () => null 
  }
});
```
This is beautiful. The rendering logic is defined as a mapping table. No leaky ternary operators in your JSX.

#### 13.3 Optimized Lists: `list`

We already discussed `useList` (Chapter 12) for optimization.
`@effector/reflect` provides the `list` operator to apply this pattern to existing components without writing the mapping callback manually.

```tsx
import { list } from '@effector/reflect';
import { $userIds } from './model';
import { UserCard } from './ui'; // A reflected component!

export const UserGrid = list({
  source: $userIds,
  view: UserCard,
  bind: {
    // Maps the array item (id) to the prop 'userId' of the child
    userId: (id) => id 
  },
  // Map index to prop (optional)
  mapIndex: { index: 'listIndex' } 
});
```

You just constructed a fully virtualized, reactive grid without writing a single function body.

#### 13.4 Context-Aware Binding: Hooks in `bind`

Sometimes you need to grab a value from React Context (like a `theme` or `className` from CSS modules) and mix it with Effector state.
`bind` supports hooks.

```tsx
const UserGreeting = reflect({
  view: Text,
  bind: {
    // Normal store binding
    value: $userName,
    
    // Hook binding!
    className: () => {
      const theme = useTheme(); // React Hook
      return theme.isDark ? 'text-white' : 'text-black';
    }
  }
});
```

#### 13.5 Why go this far?

You might ask: *"Is this over-engineering? Hooks work fine."*

For small apps? Yes, maybe.
For large Enterprise Design Systems? No.

**The Benefits:**
1.  **Strict Layering:** UI Components (pure) in `/ui`. Logic (stores) in `/model`. Reflection (binding) in `/view`.
2.  **Storybook Freedom:** Your `/ui` components have *zero* dependency on Effector. You can drop them into Storybook easily. To test the `SubmitButton`, you import the *Generic* `Button` in Storybook, not the tied one.
3.  **Visual Refactoring:** If the designer says "Change the Button to a Link", you change the `view` property in `reflect`. The wiring remains identical.

**The "Atomic" Rule:**
Use `reflect` for atoms and molecules (Buttons, Inputs, Status Icons).
Use `useUnit` for huge Layouts or Pages where explicit structure helps readability.

---

### Chapter 14: Server-Side Rendering (SSR) & React Server Components

This is where the boys are separated from the men.
Most state libraries fall apart in a server environment. Global variables persist between requests. State leaks from User A to User B. The app crashes because `window` is missing.

Effector was built with a nuclear bunker mentality. It solved these problems years before Next.js 13 made them famous.

To master SSR, you must understand one thing: **The Node.js process is a long-lived zombie.** It does not die after a request. Your state *must* live in short-lived containers called **Scopes**, or you will leak data.

#### 14.1 The Scope: Containerizing State

In the browser, "Global State" is fine because there is only one user: You.
On the server, "Global State" is catastrophic. If you write `$user = createStore('Alice')`, then Alice logs in, and then Bob makes a request, Bob will see "Alice".

Effector solves this with `fork` and `Scope`.

*   **Global Definition:** You define the *structure* of your stores globally (the "Blueprint").
*   **Scoped Instance:** You create an *instance* of that structure for each request (the "Building").

**Server Code (Generic concept):**
```typescript
import { fork, allSettled, serialize } from 'effector';
import { appStarted } from './app';

async function handleRequest(req, res) {
  // 1. Fork a clean scope (Isolation Container)
  const scope = fork({
    values: {
      // You can pre-seed stores here (e.g. cookies)
      [$token]: req.cookies.token
    }
  });

  // 2. Trigger the startup event inside the scope
  await allSettled(appStarted, { 
    scope,
    params: { path: req.url }
  });

  // 3. Serialize the final state
  const stateJson = serialize(scope);

  // 4. Send HTML + State to client
  res.send(renderHtml(stateJson));
}
```
**`fork()`**: Creates the bubble. All stores inside this scope are copies. They do not touch the global variables.
**`allSettled()`**: The magic awaiter. It triggers an event *in that scope* and waits for all resulting effects and logic chains to finish.

#### 14.2 The App Router Era (Next.js 14+)

In the "Pages Router" days (`getServerSideProps`), we used `effector-next`.
In the "App Router" (RSC) era, the paradigm shifts. React Server Components *cannot* have interactivity or state hooks (`useUnit`). They are stateless templates.

The architecture becomes: **Server fetches -> Hydrates Client -> Client Logic runs.**

We use a "Provider" pattern at the root of our client tree.

**1. The Root Provider (`EffectorNext` equivalent):**
Since Next.js 14 serializes props deeply, passing a raw JSON blob is efficient.

```tsx
// components/EffectorProvider.tsx (Client Component)
'use client';

import { fork, serialize } from 'effector';
import { Provider } from 'effector-react';
import { useMemo } from 'react';

// Use an initializer function
export function EffectorNextProvider({ 
  values, 
  children 
}: { 
  values: any, 
  children: React.ReactNode 
}) {
  const scope = useMemo(() => fork({ values }), [values]);
  
  return (
    <Provider value={scope}>
      {children}
    </Provider>
  );
}
```

**2. The Server Page (RSC):**
The server component fetches initial data *however it wants* (direct DB calls, `fetch`, or even triggering Effector logic if you really want to wrap logic), and passes it to the client.

*Kinetic Pattern (The Hybrid):* Use Effector strictly on the Client for Logic, use Next.js for initial data transport.

```tsx
// app/page.tsx (Server Component)
import { EffectorNextProvider } from '@/providers';
import { $user } from '@/models/user';

async function Page() {
  const userData = await db.getUser();
  
  // Hydrate the store "values" map
  const values = {
    [$user.sid]: userData // You need SIDs for this manual mapping
  };

  return (
    <EffectorNextProvider values={values}>
      <ClientPage />
    </EffectorNextProvider>
  );
}
```

**Wait! Mapping by `sid` manually is tedious.**
That's why `babel-plugin-effector` or SWC plugin is **Mandatory**. It adds the Stable ID (`sid`) to every store automatically.
You should serialize using a helper that matches SIDs automatically if you run logic on the server node.

#### 14.3 Next.js: Running Logic on the Server

Sometimes you don't just want to pass data. You want to execute *logic* (permissions, complex filtering) on the server using your shared Effector models.

You can still use `fork/allSettled` in a Server Component!

```tsx
// app/profile/page.tsx
import { fork, allSettled, serialize } from 'effector';
import { profileOpened } from '@/features/profile';

async function ProfilePage() {
  const scope = fork();
  
  // Run your shared business logic on the server!
  await allSettled(profileOpened, { scope });
  
  // Snapshot the result
  // OPTIMIZATION: Only serialize what is needed!
  // Don't send the entire state of the universe to the client.
  // Mark internal stores with { serialize: 'ignore' } in their definition,
  // or use the `ignore` option here if supported by your version.
  const values = serialize(scope);
  
  return (
    <EffectorNextProvider values={values}>
      <ProfileView />
    </EffectorNextProvider>
  );
}
```
This is the **Holy Grail**.
1.  **Code Reuse:** The `profileOpened` event runs the *same* logic on Server and Client.
2.  **No Flicker:** The UI hydrates with the data already present (`$data` store is populated).

#### 14.4 The "Client Boundary" Trap

Do not execute `allSettled` for events that use browser APIs (like `localStorage` or `window.scrollTo`).
Effector works in Node, but `window` does not.
*   **Fix:** Use `if (typeof window !== 'undefined')` checks in your effects, or use libraries like `@withease/web-api` which safely no-op on the server.
*   **Effects on Server:** If an effect makes an API call (`axios`, `fetch`), ensure the authentication token is passed correctly. On the client, it might be in a generic header hook. On the server, it must be extracted from the request context and injected via `scope`.

#### 14.5 Hydration Mismatch

A classic bug.
Server renders: `<div>Time: 12:00</div>`
Client renders: `<div>Time: 12:01</div>` (because 1 second passed).
React yells.

In Effector, ensure that time-dependent stores are seeded with a fixed value during hydration, or mark those components as client-only (using `useEffect` to show the time *after* mount).

#### 14.6 Scope Loss in Async Closures

If you write this in a Component logic file:

```typescript
// BAD
someEffect.use(async () => {
  setTimeout(() => {
    anotherEvent(); // ⚠️ This might lose the Scope context!
  }, 1000);
});
```
On the server, context tracking relies on Node.js mechanisms. Breaking the promise chain can detach the execution from the Scope.
**Solution:** Always await standard Promises. If using callbacks, utilize `scopeBind` (rarely needed if using `effector-react` correctly).

---

## PART VI: QUALITY CONTROL

### Chapter 15: Debugging & Inspection

You’ve built the engine. It’s powerful, it’s fast, but eventually, smoke is going to come out of the exhaust. Some event isn't firing, or a store is getting a value you didn't expect.

Junior developers start littering their code with `console.log` inside `.watch()` calls. 
**Stop.**

You’ve been paying attention, right? I told you `.watch` is dead. I told you `console.log` is a sign of weakness. Every log you manually type is a line of code you’ll have to delete later. It’s garbage that obscures the beauty of the graph.

In a Kinetic architecture, we don't guess. We **Inspect**. We don't trace. We **Audit**.

Effector provides a surgical suite of tools to see exactly how the "electricity" flows through your units without ever polluting your business logic.

#### 15.1 The Developer's Scope: `patronum/debug`

When you’re actively hammering out a feature and you need to see what’s happening in a specific model, reach for `debug` from the `patronum` library.

**Why use this?** Because it understands Effector units better than a standard logger. It labels the output with the store/event names (provided you’re using the Babel/SWC plugin).

```typescript
import { debug } from 'patronum';
import { $user, loginFx, loginForm } from './model';

// Log one or multiple units simultaneously
debug($user, loginFx, loginForm.submit);
```

**The Kinetic Pattern:**
Do not leave `debug` in your code. It is a temporary sensor.
When `loginFx` fires, `debug` will log:
*   The parameters passed to the effect.
*   The successful result (done).
*   The error (fail).
It shows you the entire lifecycle of the async operation in your console with zero boilerplate. When you're done, delete the line. Your model remains clean.

#### 15.2 The God-View: `inspect`

This is the newest, most advanced addition to the Effector toolkit (available since v23). 
The **Inspect API** allows you to hook into the runtime's internal message bus. It’s like putting a wiretap on every single unit in your application.

This isn't for "quick logs." This is for building your own **DevTools**, analytics tracers, or deep performance monitors.

**Syntax:**
```typescript
import { inspect } from 'effector';

inspect({
  fn: (declaration) => {
    // This function runs for EVERY update in the graph
    const { type, name, kind, value, meta } = declaration;
    
    if (type === 'update' && kind === 'store') {
       console.log(`Store [${name}] changed to:`, value);
    }
    
    if (type === 'trace') {
       // Deep causality information
       console.log('Action trace:', declaration.trace);
    }
  }
});
```

**What this enables:**
You can set up a "Debug Mode" in your app that, when enabled, exports the entire state change history to a visualizer. It works regardless of whether you're using React or running in Node (SSR). You don't have to connect units manually. `inspect` sees everything that is currently "alive."

#### 15.3 Causality Audit: `debug_traces`

The hardest question in a reactive graph is: *"I see that Store X updated to 'False'. But **WHO** triggered the chain that led to this change?"*

In standard React, you’re lost in a stack trace of anonymous hook updates.
In Effector, you use **Traces**.

```typescript
import { inspect, debug_traces } from 'effector';

// Setup a causal tracer
inspect({
  // Filter for specific events you want to audit
  filter: (decl) => decl.kind === 'event' && decl.name === 'criticalFailure',
  fn: (decl) => {
    // This logs the entire path from the Clock to the Target
    console.log('Trace to failure:', debug_traces(decl));
  }
});
```

**What is a "Trace"?**
It is a logical sequence of events. 
> `buttonClicked` -> `sample (clock)` -> `fetchFx (call)` -> `fetchFx.fail` -> `criticalFailure`

`debug_traces` reconstructs this map for you. You don't see a call stack of JS functions; you see a **Logic Path**. This is why we call Effector "declarative"—the path exists in the code's structure, and these tools simply reveal it to you.

#### 15.4 Tooling: The Browser Extension

If you're using the Babel/SWC plugins, your units have **SIDs**. These stable IDs allow browser extensions to recognize your units across refreshes. 

There are community-driven tools like **Effector Inspector** (and various Amur variants) that provide a GUI inside your browser. You can:
1.  **View all Stores:** Search by name and see current values.
2.  **Manually Trigger Events:** Simulate a "Submit" or a "Server Error" by clicking a button in the DevTools UI.
3.  **Trace Updates:** See a real-time "matrix" stream of everything happening in the graph.

#### 15.5 Debugging in SSR/Scopes

This is where traditional loggers fail. On a server, you have 100 scopes running at once. If you just log a store value, which user's store are you seeing?

The `inspect` and `debug` tools are **Scope-aware**.
*   When running under a `Scope` (in a test or on a server), these tools will show you the value relative to the current execution context. 
*   This allows you to debug "Concurrent Request Leaks." If you see Store A updating in a trace that should only belong to Request B, you’ve found your bug.

#### 15.6 The "Sanity Check" Log

Only use this for the most extreme situations where `inspect` isn't feasible:

```typescript
// 🤮 Don't do this often
const $store = createStore(0);
$store.on(event, (val) => {
  console.log('Update happening!'); // This is manual labor. REJECT IT.
  return val + 1;
});
```

**Final Debugging Advice:**
If your logic is hard to debug, it's usually because your `sample` blocks are too big. If you're doing complex math inside the `fn` of a `sample`, pull that math out into a named pure function. Test the math separately. Keep the graph as a router of data, not a calculator.

### Chapter 16: Automated Enforcement (ESLint)

A playbook is useless if developers ignore it. You cannot rely on code review alone to catch "Component State" leakage or `.watch` usage. You must enforce the Kinetic architecture at the compiler level.

Install **`eslint-plugin-effector`**.
Configure your `.eslintrc` (or flat config) with these non-negotiable rules:

1.  **`effector/no-watch`**: **Error**. Forces developers to use `sample` and `inspect`.
2.  **`effector/enforce-store-naming-convention`**: **Error**. Enforces the `$` prefix. This keeps the code visual.
3.  **`effector/no-getState`**: **Error**. Prevents imperative reads. Forces reactive flow.
4.  **`effector/mandatory-scope-binding`**: **Error**. Prevents scope loss in effects.

If the linter fails, the build fails. This is how you maintain architecture at scale.

### Chapter 17: Testing Strategies — The Final Empirical Proof

Listen up. This is where most developers reveal themselves as amateurs. They spend weeks building a "Logic Engine," then they test it by mounting it in a fake browser, clicking a virtual button, and waiting 500ms for a DOM change.

That’s not testing. That’s hope. And hope is for people who didn't build their machine correctly.

In the Kinetic Engine, testing is an **Empirical Investigation**. We are going to isolate the brain, stimulate its nerves, and measure the results with surgical precision. Because Effector separates Logic from View, you can test your entire application without ever starting a rendering engine. No JSDOM, no CSS, no React, just pure, crystalline logic.

#### 17.1 The Immutable Doctrine: Isolation via `fork`

Repeat after me: **I will never test a unit directly.**

If you test a store by importing it and calling `store.getState()`, you are an idiot. You are polluting a global variable that will leak into the next test. Your tests will pass locally and fail in CI. You will chase ghosts.

The **Fork Doctrine** dictates that every single test case must operate in its own pristine, isolated universe called a **Scope**.

1.  **`fork()`**: You create a "clone" of your entire application graph. This clone is a memory-only instance.
2.  **Mocking**: You don't use `vi.mock` or `jest.mock`. You use the `handlers` property inside `fork`.
3.  **Assertions**: You check values inside the scope using `scope.getState()`.

**Tactical Setup:**
You **must** have the Babel or SWC plugin enabled in your test runner (Vitest/Jest). Without it, SIDs (Stable IDs) won't exist, and `fork()` won't know how to map your stores. If your tests are returning `undefined` or the default value when they shouldn't, you fucked up your plugin config.

```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [
    // Ensure effector-swc-plugin or babel-plugin is active here!
  ]
});
```

#### 17.2 Anatomy of a Kinetic Test

Let’s be meticulous. We’re testing a "Login Flow." 
Logic: User submits -> API call starts (Pending=true) -> Success -> User stored & Route changed.

```typescript
import { fork, allSettled } from 'effector';
import { loginModel } from './model';

test('login should succeed with valid credentials', async () => {
  // 1. SETUP: Create the isolated bubble
  const scope = fork({
    handlers: [
      // MOCK THE EXTERNAL WORLD HERE
      [loginModel.loginFx, async ({ email }) => ({ id: '1', name: 'Johny' })]
    ],
    values: [
      // SEED INITIAL STATE (if needed)
      [loginModel.$email, 'test@kinetic.io']
    ]
  });

  // 2. STIMULATE: Fire the event IN THE SCOPE
  // We don't call submitClicked(). We call allSettled().
  await allSettled(loginModel.submitClicked, { 
    scope 
  });

  // 3. ASSERT: Inspect the final state of the machine
  expect(scope.getState(loginModel.$user)).toEqual({ id: '1', name: 'Johny' });
  expect(scope.getState(loginModel.$isAuthenticated)).toBe(true);
});
```

**Why `allSettled`?**
Standard JS promises only tell you when one thing finishes. `allSettled` tells you when the **entire logic storm** is over. It waits for the event, the effect, and every `sample` chain triggered by them to come to a full stop. If you don't use `allSettled`, you’re asserting on state that is still changing. That’s a race condition in your test. Don’t do it.

#### 17.3 The Art of Mocking: The "Edge" Theory

Don't mock your internal stores. Don't mock your `sample` logic.
You only mock the **Edges**. The Edges are the `Effects` that talk to things outside the Effector graph (API, Cookies, LocalStorage).

*   **Mocking APIs:** Use the `handlers` array in `fork`. This is the cleanest dependency injection in the industry. It's type-safe. It's local.
*   **Testing Errors:** Want to see how your app handles a 500 error? Force the mock to throw.

```typescript
const scope = fork({
  handlers: [
    [loginFx, () => Promise.reject(new Error('Internal Server Error'))]
  ]
});

await allSettled(submitClicked, { scope });

expect(scope.getState($error)).toBe('Internal Server Error');
expect(scope.getState($isAuthenticated)).toBe(false);
```

#### 17.4 Testing the "Impossible": Race Conditions

Effector is the ultimate tool for handling concurrency, but you have to prove it. Let's say you want to test that if a user clicks a button twice, and the first request takes longer, the final state is correct (the "ABA Problem").

```typescript
test('should handle race conditions (last request wins)', async () => {
  let callCount = 0;
  
  const scope = fork({
    handlers: [
      [fetchDataFx, async () => {
        callCount++;
        if (callCount === 1) {
          await delay(100); // First call takes long
          return 'First Data';
        }
        return 'Second Data'; // Second call is fast
      }]
    ]
  });

  // Start two triggers in parallel
  const p1 = allSettled(refreshTriggered, { scope });
  const p2 = allSettled(refreshTriggered, { scope });

  await Promise.all([p1, p2]);

  // If your model uses Farfetched or correct samples, 
  // the state should reflect the LATEST data.
  expect(scope.getState($data)).toBe('Second Data');
});
```

#### 17.5 Meticulous Factory Testing

When you use `@withease/factories` (Chapter 6), you aren't testing global units. You’re testing **Generation Logic**.

To test a factory, you invoke the factory function and then target its *instance-specific* units inside `allSettled`.

```typescript
import { createCounterModel } from './counter.factory';

test('factory instances should be independent', async () => {
  const modelA = createCounterModel(0);
  const modelB = createCounterModel(100);

  const scope = fork();

  // Trigger increment on model A only
  await allSettled(modelA.increment, { scope });

  expect(scope.getState(modelA.$count)).toBe(1);
  expect(scope.getState(modelB.$count)).toBe(100); // Untouched
});
```

This confirms your encapsulation is bulletproof.

#### 17.6 Testing with Routing (`atomic-router`)

Don't mount a `BrowserRouter` to test if a redirect happens. Test the route's state.

```typescript
test('redirects to login when unauthorized', async () => {
  const scope = fork({
    values: [[$isAuthenticated, false]] // User is not logged in
  });

  await allSettled(settingsRoute.opened, { scope });

  // Assert that the 'opened' status of the login route is now true
  expect(scope.getState(loginRoute.$isOpened)).toBe(true);
  // And settings is not opened (or was redirected)
  expect(scope.getState(settingsRoute.$isOpened)).toBe(false);
});
```

#### 17.7 Persistence & Timers (The "Real World")

Testing time-based logic (debounce/delay from Chapter 7) usually sucks. You have to use `vi.useFakeTimers()`. 
With Effector + Patronum, this is straightforward, provided you **wait** for the timer within the scope.

```typescript
test('debounced search should only fire once', async () => {
  vi.useFakeTimers();
  const scope = fork({
    handlers: [[searchFx, vi.fn()]]
  });

  allSettled(searchChanged, { scope, params: 'f' });
  allSettled(searchChanged, { scope, params: 'fo' });
  allSettled(searchChanged, { scope, params: 'foo' });

  vi.runAllTimers(); 
  // allSettled will catch the resulting events triggered by timers
  await delay(0); // Tick the microtask queue

  const mockHandler = scope.getState(searchFx.handler); // Experimental/internal retrieval
  // Or better, use a variable inside your mock handler
  expect(apiCallCount).toBe(1);
});
```
*Note: Actually, mocking the Effect handler via `vi.fn()` inside `fork`'s handlers is the professional way. You then inspect that specific vitest mock.*

#### 17.8 Checklist for a 100% Quality Model

If you want to be "Meticulous," you don't just test success. For every Model, you must test:

1.  **Initial Invariants:** What is the state when the machine is brand new?
2.  **Success Pathways:** Does the data flow through to the targets?
3.  **Failure States:** Does an Error in an Effect correctly map to the Error Store and trigger UI alerts?
4.  **Pending Integrity:** Does the `pending` store turn `true` exactly when requested and `false` exactly when done? (Use a non-awaited `allSettled` or partial steps to verify).
5.  **Persistence Restoration:** If I `fork` with `values` from `serialize(oldScope)`, does the new scope behave exactly like the old one? (Tests your SSR/Persistence logic).
6.  **Idempotency:** Does calling an event twice when it shouldn't produce a redundant update? (Checks your `filter` and `immutability`).

#### 17.9 A Word on Integration Testing

At the end of the day, you can run your *entire app logic* in one test file. 
You can `fork()` the whole root of the application, provide a few mock handlers for the network, and simulate a whole session:
`Auth -> Redirect -> Fetch Feed -> Click Like -> Log Out`.

Because it's just state and functions, this test will run in **milliseconds**. You could have 10,000 of these integration tests and your CI pipeline will still be faster than a single Cypress run. This is why Effector wins.

### Chapter 18: The Refactoring Algorithm

You are likely not starting greenfield. You are looking at a messy Redux or Context codebase. How do you migrate without stopping production? Follow this algorithm.

1.  **The Freeze:** Stop adding new features to the legacy code. If you touch a legacy component, you must refactor it.
2.  **The Parallel Model:** Create a `model.ts` file next to your legacy component. Build the Effector logic there. It should not be connected to the View yet.
3.  **The Bridge:** Inside your legacy component, use `useUnit` to subscribe to the new model.
    *   *Before:* `dispatch(legacyAction())`
    *   *After:* `const { submit } = useUnit(model); ... onClick={submit}`
4.  **The Strangler Fig:** Move logic line-by-line from `useEffect` / `thunks` into `sample` chains in your model. The component code should shrink.
5.  **The Kill:** Once the `useEffect` is empty and the Redux selector is gone, delete the legacy state slices.

### CONCLUSION: AN ARCHITECTURAL VERDICT

If you have followed this Playbook, you are no longer a "frontend dev." You are a **Systems Architect**. 

You understand that **State** is the memory of your app, **Events** are its nervous impulses, and **Effects** are its hands. You have used `sample` to weave these into a logical tapestry that exists independently of any UI library. 

You’ve mastered:
*   **Atomic Reactivity** (Core)
*   **Transaction Consistency** (Sample)
*   **Abstraction and Scaling** (Factories)
*   **Network Resilience** (Farfetched)
*   **Navigational Purity** (Atomic Router)
*   **Total Isolation** (Scope/SSR)
*   **Absolute Auditability** (Inspect/Test)

The code you write now isn't "React code." It’s a pure mathematical description of your business. It is fast, it is testable, and it is bulletproof.

Now, stop reading. The simulation is over. 

Go into your codebase. Find the messy `useEffect` hooks. Find the fragile `global` variables. Find the thunks full of `try/catch` and `.getState()`. 

**Tear them apart.** 

Build your Kinetic Engine. Wire it correctly. And watch it work with the cold, ruthless efficiency of a machine designed by a professional. 

Stay tactical. Stay authentic. Keep your logic out of the view.

**END OF PLAYBOOK.**