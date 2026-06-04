# flow-no-side-effects-in-map

## Why
`.map()` must be pure. Side effects inside `map` are invisible to the graph and break testability.

## Avoid
```ts
const normalized = emailChanged.map((email) => {
  analytics.track('email_changed');
  return email.trim().toLowerCase();
});
```

## Prefer
```ts
const normalized = emailChanged.map((email) => email.trim().toLowerCase());

sample({
  clock: emailChanged,
  target: trackEmailChangedFx,
});
```
