# fx-compose-effects-explicitly

## Why
When an effect depends on other effects, await them explicitly or run in parallel. This keeps async flow deterministic and visible.

## Prefer
```ts
// correct usage for an effect without inner effects
const delayFx = createEffect(async () => {
  await new Promise((resolve) => setTimeout(resolve, 80));
});

// correct usage for an effect with inner effects
const authFx = createEffect(async () => {
  await loginFx();

  await Promise.all([loadProfileFx(), loadSettingsFx()]);
});
```
