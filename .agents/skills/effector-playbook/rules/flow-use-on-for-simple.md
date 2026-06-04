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
