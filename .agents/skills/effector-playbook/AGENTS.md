# Effector Reliability Rules (Compiled)



This file concatenates the rule files in `rules/` for quick reference.



# core-no-guard-forward

## Why
`guard` and `forward` are legacy wiring helpers. `sample` covers the same use cases with `filter`, `source`, and `target` while keeping the graph explicit and extensible.

## Avoid
```ts
import { createStore, createEffect, createEvent, guard } from "effector";

const clickRequest = createEvent();
const fetchRequest = createEffect((n) => new Promise((rs) => setTimeout(rs, 2500, n)));

const $clicks = createStore(0).on(clickRequest, (x) => x + 1);
const $requestsCount = createStore(0).on(fetchRequest, (x) => x + 1);

const $isIdle = fetchRequest.pending.map((pending) => !pending);

guard({
  clock: clickRequest,
  filter: $isIdle,
  source: $clicks,
  target: fetchRequest,
});
```

## Prefer
```ts
sample({
  clock: clickRequest,
  source: $clicks,
  filter: $isIdle,
  target: fetchRequest,
});
```

## Notes
- For simple forwarding: `sample({ clock: a, target: b })`.

# core-no-watch

## Why
`.watch` creates side effects outside the graph and is hard to test or trace. Use effects and `sample` for side effects. For debugging, use `inspect` or `patronum/debug` and remove after.

## Avoid
```ts
userLoggedIn.watch(() => {
  analytics.track('login');
});
```

## Prefer
```ts
sample({
  clock: userLoggedIn,
  target: trackLoginFx,
});
```

## Notes
- Keep debugging out of production logic; prefer `inspect({ fn })` in dev only.

# core-no-getstate

## Why
Imperative `getState()` reads are time-incorrect in async flows and break determinism. Use `sample` or `attach` to read stores at the correct clock time.

## Avoid
```ts
const submitFx = createEffect(async () => {
  const token = $token.getState();
  return api.post('/submit', { token });
});
```

## Prefer
```ts
const submitFx = createEffect(async ({ token }) => {
  return api.post('/submit', { token });
});

sample({
  clock: submitClicked,
  source: $token,
  fn: (token) => ({ token }),
  target: submitFx,
});
```

# core-logic-outside-view

## Why
Business logic belongs in models, not in UI components. This keeps logic testable and deterministic and prevents view changes from breaking flows.

## Avoid
```ts
const Component = () => {
  useEffect(() => {
    fetch('/api/profile').then(setProfile);
  }, []);
  return <ProfileView />;
};
```

## Prefer
```ts
const submitClicked = createEvent();
const submitFx = createEffect(api.submit);

sample({
  clock: submitClicked,
  source: $form,
  target: submitFx,
});
```

# core-store-naming

## Why
Use `$` prefix for stores to make reactive state obvious at a glance.

## Avoid
```ts
const counter = createStore(0);
```

## Prefer
```ts
const $counter = createStore(0);
```

# flow-use-sample-for-time-correct

## Why
`sample` reads `source` at the exact moment `clock` fires, preventing race conditions and stale reads.

## Avoid
```ts
submitClicked.watch(() => {
  const form = $form.getState();
  submitFx(form);
});
```

## Prefer
```ts
sample({
  clock: submitClicked,
  source: $form,
  target: submitFx,
});
```

# flow-use-on-for-simple

## Why
Do not use `sample` for trivial store updates. It adds noise and hides simple reducers.
Use `.on`/`.reset` when the update is a direct reaction to an event or effect.

## Hard Rule
- If you are **not** using `source`, `filter`, or multi-unit wiring, you should **not** use `sample`.
- If the store update is a pure reducer from the event payload, use `.on`.

## Avoid
```ts
sample({
  clock: increment,
  source: $count,
  fn: (count) => count + 1,
  target: $count,
});
```

## Prefer
```ts
const $count = createStore(0).on(increment, (n) => n + 1);
```

## Also Prefer
```ts
const $form = createStore(initial).reset(formClosed);
```

# flow-no-side-effects-in-map

## Why
`.map()` must be pure. Side effects inside `map` are invisible to the graph and break testability.

## Avoid
```ts
const normalized = emailChanged.map((email) => {
  analytics.track('email_changed');
  return email.trim().toLowerCase();
});
```

## Prefer
```ts
const normalized = emailChanged.map((email) => email.trim().toLowerCase());

sample({
  clock: emailChanged,
  target: trackEmailChangedFx,
});
```

# flow-avoid-circular-imports

## Why
Circular imports break bundlers and make graphs hard to reason about. Define units first, wire them after, and keep dependencies one-way.

## Prefer
```ts
// model.ts
const event = createEvent();
const $store = createStore(0);

sample({ clock: event, target: someFx });
```

# fx-use-effect-lifecycle

## Why
Effects provide built-in lifecycle units (`pending`, `doneData`, `failData`). Use them instead of ad-hoc loading and error state.

## Avoid
```ts
const $loading = createStore(false);
const $error = createStore('');

submitClicked.watch(async (payload) => {
  $loading.setState(true);
  try {
    await api.submit(payload);
  } catch (e) {
    $error.setState(String(e));
  } finally {
    $loading.setState(false);
  }
});
```

## Prefer
```ts
const submitFx = createEffect(api.submit);

const $loading = submitFx.pending;
const $error = createStore('').on(submitFx.failData, (_, e) => String(e));
```

# fx-compose-effects-explicitly

## Why
When an effect depends on other effects, await them explicitly or run in parallel. This keeps async flow deterministic and visible.

## Prefer
```ts
// correct usage for an effect without inner effects
const delayFx = createEffect(async () => {
  await new Promise((resolve) => setTimeout(resolve, 80));
});

// correct usage for an effect with inner effects
const authFx = createEffect(async () => {
  await loginFx();

  await Promise.all([loadProfileFx(), loadSettingsFx()]);
});
```

# fx-use-attach-to-inject-deps

## Why
Use `attach` to inject store values into effects instead of reading with `getState()`.

## Avoid
```ts
const saveFx = createEffect((payload) => api.save({
  token: $token.getState(),
  payload,
}));
```

## Prefer
```ts
const baseSaveFx = createEffect(({ token, payload }) => api.save({ token, payload }));

const saveFx = attach({
  source: $token,
  effect: baseSaveFx,
  mapParams: (payload, token) => ({ token, payload }),
});
```

# model-use-factories

## Why
Factories create isolated model instances and prevent accidental global state sharing. This is critical for SSR and multi-instance features.

## Avoid
```ts
// global singleton for every widget instance
export const $value = createStore(0);
```

## Prefer
```ts
export const createCounterModel = (initial = 0) => {
  const increment = createEvent();
  const $count = createStore(initial).on(increment, (n) => n + 1);
  return { $count, increment };
};
```

# model-normalize-entities

## Why
Store large collections in normalized form to avoid full-array updates and unnecessary re-renders.

## Avoid
```ts
const $users = createStore<User[]>([]);
```

## Prefer
```ts
const $userIds = createStore<string[]>([]);
const $usersById = createStore<Record<string, User>>({});
```

# react-useunit

## Why
`useUnit` provides a single, consistent binding for stores and events. It reduces boilerplate and keeps components simple.

## Prefer
```ts
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

# patronum-use-debounce-throttle

## Why
Use Patronum timeouts for debounce/throttle instead of manual timers. The operators stay inside the Effector graph and keep flows testable.

## Prefer
```ts
import { debounce, throttle } from "patronum";

const searchChanged = createEvent<string>();
const searchFx = createEffect(searchApi);

const searchDebounced = debounce(searchChanged, 300);

sample({
  clock: searchDebounced,
  target: searchFx,
});

const click = createEvent();
const clickThrottled = throttle(click, 1000);

sample({
  clock: clickThrottled,
  target: trackClickFx,
});
```

## Notes
- patronum < 2.1.0 uses `debounce({ source, timeout })` and `throttle({ source, timeout })`.

# patronum-use-condition

## Why
Use `condition` to branch a flow into then/else targets based on a boolean store or predicate. It keeps branching explicit and avoids multiple `sample` blocks.

## Prefer
```ts
import { condition } from "patronum";

condition({
  source: submitClicked,
  if: $isValid,
  then: submitFx,
  else: showValidationError,
});
```

# patronum-use-pending-inflight-status

## Why
Use Patronum helpers to aggregate effect status instead of manual stores or ad-hoc counters.

## Prefer
```ts
import { pending } from "patronum/pending";
import { inFlight } from "patronum/in-flight";
import { status } from "patronum/status";

const $isLoading = pending([loadFx, saveFx]);
const $inFlightCount = inFlight([loadFx, saveFx]);
const $loadStatus = status(loadFx); // "initial" | "pending" | "done" | "fail"
```

## Notes
- patronum < 2.1.0 uses `pending({ effects })`, `inFlight({ effects })`, `status({ effect })`.

# patronum-use-combineevents

## Why
Use `combineEvents` when you need to wait for multiple events before proceeding. It removes manual state tracking and keeps the flow declarative.

## Prefer
```ts
import { combineEvents } from "patronum";

const ready = combineEvents({
  userLoaded: userLoaded,
  settingsLoaded: settingsLoaded,
});

sample({
  clock: ready,
  target: startAppFx,
});
```

## Notes
- patronum 2.1.0 supports `combineEvents([a, b])` and `combineEvents({ key: a })`.
- patronum < 2.1.0 uses `combineEvents({ events })`.

# scope-use-fork-allsettled

## Why
Use `fork` to isolate state and `allSettled` to wait for full graph completion. This is required for deterministic SSR and tests.

## Prefer
```ts
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

# scope-use-scopebind-for-external

## Why
External callbacks (timers, sockets, DOM listeners) must be bound to a scope to preserve context in SSR/tests.

## Prefer
```ts
import { createEvent, sample, fork, scopeBind, allSettled } from "effector";

test("integration with externalSource", async () => {
  const scope = fork();

  const updated = createEvent();

  sample({
    clock: updated,
    target: someOtherLogicStart,
  });

  // 1. Subscribe event to external source
  const externalUpdated = scopeBind(updated, { scope });
  externalSource.listen(() => externalUpdated());

  // 2. Trigger update of external source
  externalSource.trigger();

  // 3. Wait for all triggered computations in effector's scope
  await allSettled(scope);

  // 4. Check anything as usual
  expect(...).toBe(...);
});
```

# ssr-use-sids-plugin

## Why
SSR and serialization require SIDs for units. Use the Babel or SWC plugin to generate stable IDs.

## Notes
- Without SIDs, `fork` serialization and hydration will be brittle or incorrect.
- Use the plugin even in tests for predictable scopes.

# test-mock-effects-with-fork-handlers

## Why
Use `fork({ handlers })` to mock external effects in a scoped, deterministic way.

## Prefer
```ts
const scope = fork({
  handlers: [
    [fetchUserFx, async () => ({ id: "1", name: "User" })],
  ],
});

await allSettled(loadUserClicked, { scope });
expect(scope.getState($user)).toEqual({ id: "1", name: "User" });
```

# debug-use-inspect

## Why
Use `inspect` or `patronum/debug` for tracing without polluting production logic. Remove debug wiring after diagnosis.

## Avoid
```ts
$store.watch((value) => console.log(value));
```

## Prefer
```ts
import { inspect } from "effector";

inspect({
  fn: (update) => {
    // log updates during debugging only
  },
});
```

# lint-use-eslint-plugin-effector

## Why
Linting enforces architecture and prevents regression to imperative patterns.

## Prefer
```ts
// eslint config (conceptual)
{
  "plugins": ["effector"],
  "rules": {
    "effector/no-watch": "error",
    "effector/no-getState": "error",
    "effector/enforce-store-naming-convention": "error",
    "effector/mandatory-scope-binding": "error"
  }
}
```

