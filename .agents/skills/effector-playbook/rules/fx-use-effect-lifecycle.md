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
