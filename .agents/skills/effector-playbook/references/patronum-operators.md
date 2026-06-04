# Patronum Operators (Summary)

Source: patronum.effector.dev/operators

## Version Notes (API signatures)
- patronum 2.1.0 introduced shorthand signatures for several operators:
  - `debounce(source, timeout)` (older: `debounce({ source, timeout })`)
  - `throttle(source, timeout)` (older: `throttle({ source, timeout })`)
  - `pending([fx1, fx2])` (older: `pending({ effects })`)
  - `inFlight([fx1, fx2])` (older: `inFlight({ effects })`)
  - `status(effect)` (older: `status({ effect })`)
  - `combineEvents([event1, event2])` or `combineEvents({ key: event })` (older: `combineEvents({ events })`)

## Combination
- combineEvents - Wait for all passed events to trigger.
- format - Combine stores to a string literal.
- previous - Get previous value of store.
- readonly - Create a readonly version of store or event.
- reshape - Split one store into multiple stores.
- snapshot - Create a store snapshot at the time of a clock.
- splitMap - Split event into multiple events and map data.
- spread - Send fields from an object to targets.

## Debug
- debug - Log triggers of passed units.

## Effect
- inFlight - Count all pending effects.
- pending - Check whether any effects are pending.
- status - Return text representation of an effect state.

## Predicate
- and - Check all stores for truthy values.
- condition - Route flow to `then` or `else` by condition.
- either - Select one value based on a condition.
- empty - Check a store for null.
- equals - Check a store for some value.
- every - Check that each store passes a predicate.
- not - Invert a boolean store.
- once - Allow an event to run only once.
- or - Check at least one store for truthy value.
- reset - Reset stores by a clock.
- some - Check that at least one store passes a predicate.

## Timeouts
- debounce - Emit when the timeout passes after the last trigger.
- delay - Delay event/effect calls by timeout.
- interval - Create a dynamic interval with a timeout.
- throttle - Emit at most once per timeout.
- time - Read current timestamp by triggering a clock.
