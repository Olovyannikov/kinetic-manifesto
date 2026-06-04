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
