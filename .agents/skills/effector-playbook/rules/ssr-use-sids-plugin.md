# ssr-use-sids-plugin

## Why
SSR and serialization require SIDs for units. Use the Babel or SWC plugin to generate stable IDs.

## Notes
- Without SIDs, `fork` serialization and hydration will be brittle or incorrect.
- Use the plugin even in tests for predictable scopes.
