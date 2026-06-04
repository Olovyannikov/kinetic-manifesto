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
