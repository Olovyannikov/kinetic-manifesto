# lint-use-eslint-plugin-effector

## Why
Linting enforces architecture and prevents regression to imperative patterns.

## Prefer
```ts
// eslint config (conceptual)
{
  "plugins": ["effector"],
  "rules": {
    "effector/no-watch": "error",
    "effector/no-getState": "error",
    "effector/enforce-store-naming-convention": "error",
    "effector/mandatory-scope-binding": "error"
  }
}
```
