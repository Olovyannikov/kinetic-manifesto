# patronum-use-pending-inflight-status

## Why
Use Patronum helpers to aggregate effect status instead of manual stores or ad-hoc counters.

## Prefer
```ts
import { pending } from "patronum/pending";
import { inFlight } from "patronum/in-flight";
import { status } from "patronum/status";

const $isLoading = pending([loadFx, saveFx]);
const $inFlightCount = inFlight([loadFx, saveFx]);
const $loadStatus = status(loadFx); // "initial" | "pending" | "done" | "fail"
```

## Notes
- patronum < 2.1.0 uses `pending({ effects })`, `inFlight({ effects })`, `status({ effect })`.
