# FridgeMate Project Instructions

## Product Scope

FridgeMate is a local-first MVP for Korean college students, people living alone, and beginner cooks who want to reduce food waste and decide what to eat.

The first product loop is:

1. User enters fridge ingredients.
2. App recommends recipes that can be cooked now.
3. Recipes using soon-to-expire ingredients are prioritized.
4. User cooks a recipe.
5. App subtracts the required ingredients from inventory.

## MVP Boundaries

- No authentication.
- No backend yet.
- No AI features yet.
- No barcode scanning.
- No image recognition.
- No external recipe API.
- Use local sample recipe data.
- Keep the app focused on the inventory -> recommendation -> cook -> inventory update loop.

## Tech Stack

- React
- TypeScript
- Vite
- Local state first

Design code so domain logic can later move behind a Supabase-backed repository, but do not add Supabase or backend abstractions before they are needed.

## Architecture Guidelines

- Keep domain logic separate from UI.
- Recommendation logic must be implemented as a pure function.
- Inventory consumption logic must be implemented as a pure function.
- Use explicit TypeScript types for inventory items, recipes, ingredients, units, storage types, and recommendation results.
- Keep React components small and focused on rendering or user interaction.
- Prefer simple module boundaries over framework-heavy patterns.
- Do not add global state libraries for the MVP unless local React state becomes clearly insufficient.
- Do not add routing until there is more than one meaningful screen.

Suggested structure when application code is added:

```text
src/
  domain/
    inventory.ts
    recipes.ts
    recommendation.ts
    types.ts
  data/
    sampleRecipes.ts
  components/
  App.tsx
```

## Domain Rules

- Inventory matching should be deterministic and testable.
- Expiry prioritization should be based on explicit dates, not UI ordering side effects.
- Cooking a recipe should never mutate the original inventory array.
- If inventory is insufficient, the consumption function should return a clear failure result instead of partially consuming ingredients.
- MVP quantity handling may assume matching units unless a documented conversion is intentionally added.

## UI Guidelines

- Build the actual working product surface, not a landing page.
- Prioritize fast data entry, readable inventory status, and clear recipe recommendations.
- Use labels and copy that feel natural for the target users.
- Keep styling practical and lightweight.

## Testing And Verification

- Add focused tests for pure domain functions when they are introduced.
- Run `npm run build` before finishing implementation changes when possible.
- Use `npm run lint` when changing TypeScript or React code.

## Working Rules For Agents

- Read this file before making project changes.
- Do not overengineer.
- Do not add unrelated features.
- Make reasonable MVP-level assumptions and document them.
- Do not implement backend, auth, AI, barcode, image recognition, or external API features unless explicitly requested.
- Before editing application behavior, inspect the existing files and preserve user changes.
