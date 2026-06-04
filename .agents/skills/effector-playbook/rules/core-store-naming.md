# core-store-naming

## Why
Use `$` prefix for stores to make reactive state obvious at a glance.

## Avoid
```ts
const counter = createStore(0);
```

## Prefer
```ts
const $counter = createStore(0);
```
