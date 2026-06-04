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
