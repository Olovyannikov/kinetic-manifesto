# core-logic-outside-view

## Why
Business logic belongs in models, not in UI components. This keeps logic testable and deterministic and prevents view changes from breaking flows.

## Avoid
```ts
const Component = () => {
  useEffect(() => {
    fetch('/api/profile').then(setProfile);
  }, []);
  return <ProfileView />;
};
```

## Prefer
```ts
const submitClicked = createEvent();
const submitFx = createEffect(api.submit);

sample({
  clock: submitClicked,
  source: $form,
  target: submitFx,
});
```
