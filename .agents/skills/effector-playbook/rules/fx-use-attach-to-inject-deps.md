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
