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
