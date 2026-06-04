# patronum-use-combineevents

## Why
Use `combineEvents` when you need to wait for multiple events before proceeding. It removes manual state tracking and keeps the flow declarative.

## Prefer
```ts
import { combineEvents } from "patronum";

const ready = combineEvents({
  userLoaded: userLoaded,
  settingsLoaded: settingsLoaded,
});

sample({
  clock: ready,
  target: startAppFx,
});
```

## Notes
- patronum 2.1.0 supports `combineEvents([a, b])` and `combineEvents({ key: a })`.
- patronum < 2.1.0 uses `combineEvents({ events })`.
