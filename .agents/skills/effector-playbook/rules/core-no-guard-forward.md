# core-no-guard-forward

## Why
`guard` and `forward` are legacy wiring helpers. `sample` covers the same use cases with `filter`, `source`, and `target` while keeping the graph explicit and extensible.

## Avoid
```ts
import { createStore, createEffect, createEvent, guard } from "effector";

const clickRequest = createEvent();
const fetchRequest = createEffect((n) => new Promise((rs) => setTimeout(rs, 2500, n)));

const $clicks = createStore(0).on(clickRequest, (x) => x + 1);
const $requestsCount = createStore(0).on(fetchRequest, (x) => x + 1);

const $isIdle = fetchRequest.pending.map((pending) => !pending);

guard({
  clock: clickRequest,
  filter: $isIdle,
  source: $clicks,
  target: fetchRequest,
});
```

## Prefer
```ts
sample({
  clock: clickRequest,
  source: $clicks,
  filter: $isIdle,
  target: fetchRequest,
});
```

## Notes
- For simple forwarding: `sample({ clock: a, target: b })`.
