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
