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
