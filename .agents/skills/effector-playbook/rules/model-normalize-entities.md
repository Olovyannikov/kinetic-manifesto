# model-normalize-entities

## Why
Store large collections in normalized form to avoid full-array updates and unnecessary re-renders.

## Avoid
```ts
const $users = createStore<User[]>([]);
```

## Prefer
```ts
const $userIds = createStore<string[]>([]);
const $usersById = createStore<Record<string, User>>({});
```
