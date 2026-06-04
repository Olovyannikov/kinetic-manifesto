# patronum-use-debounce-throttle

## Why
Use Patronum timeouts for debounce/throttle instead of manual timers. The operators stay inside the Effector graph and keep flows testable.

## Prefer
```ts
import { debounce, throttle } from "patronum";

const searchChanged = createEvent<string>();
const searchFx = createEffect(searchApi);

const searchDebounced = debounce(searchChanged, 300);

sample({
  clock: searchDebounced,
  target: searchFx,
});

const click = createEvent();
const clickThrottled = throttle(click, 1000);

sample({
  clock: clickThrottled,
  target: trackClickFx,
});
```

## Notes
- patronum < 2.1.0 uses `debounce({ source, timeout })` and `throttle({ source, timeout })`.
