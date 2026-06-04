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
