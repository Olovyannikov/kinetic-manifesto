# flow-avoid-circular-imports

## Why
Circular imports break bundlers and make graphs hard to reason about. Define units first, wire them after, and keep dependencies one-way.

## Prefer
```ts
// model.ts
const event = createEvent();
const $store = createStore(0);

sample({ clock: event, target: someFx });
```
