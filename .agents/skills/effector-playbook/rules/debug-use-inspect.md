# debug-use-inspect

## Why
Use `inspect` or `patronum/debug` for tracing without polluting production logic. Remove debug wiring after diagnosis.

## Avoid
```ts
$store.watch((value) => console.log(value));
```

## Prefer
```ts
import { inspect } from "effector";

inspect({
  fn: (update) => {
    // log updates during debugging only
  },
});
```
