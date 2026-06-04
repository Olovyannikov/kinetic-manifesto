# flow-prefer-sample-over-on

## Why
`sample` makes data flow explicit and easier to trace. Using `sample` consistently (even for simple updates) keeps the graph uniform and easier to reason about.

## Guideline
**Prefer `sample` over `.on`** when:
- You want to make the data flow visible and explicit
- You plan to add `source`, `filter`, or `fn` later
- You want consistent style across the codebase

**`.on` is still valid** for:
- Very simple local updates within the same file
- Reset patterns (`.reset()`)
- When `sample` would add unnecessary boilerplate

## Prefer
```ts
const todoAdded = createEvent<Todo>()
const $todos = createStore<Todo[]>([])

sample({
  clock: todoAdded,
  source: $todos,
  fn: (todos, todo) => [...todos, todo],
  target: $todos,
})
```

## Also OK (for simple cases)
```ts
const $todos = createStore<Todo[]>([]).on(todoAdded, (todos, todo) => [
  ...todos,
  todo,
])
```

## Note
This is a **style preference** for consistency and explicitness. Both patterns are correct—choose based on your team's guidelines.
