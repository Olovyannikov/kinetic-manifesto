# patronum-use-condition

## Why
Use `condition` to branch a flow into then/else targets based on a boolean store or predicate. It keeps branching explicit and avoids multiple `sample` blocks.

## Prefer
```ts
import { condition } from "patronum";

condition({
  source: submitClicked,
  if: $isValid,
  then: submitFx,
  else: showValidationError,
});
```
