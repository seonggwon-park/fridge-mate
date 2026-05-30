# FridgeMate MVP Implementation Plan

## Assumptions

- The MVP uses browser-local React state only; persistence can be added later with localStorage or Supabase.
- Recipe data starts as local static sample data tailored to simple Korean solo meals.
- Ingredient quantities only match when units are the same.
- Dates are entered manually by the user.
- The first version is a single-screen app.

## Steps

1. Define domain types for inventory items, recipe ingredients, recipes, recommendation results, units, and storage types.
2. Add local sample recipe data with realistic beginner-friendly Korean meals.
3. Implement pure recommendation logic that returns cookable recipes and prioritizes recipes using soon-to-expire inventory items.
4. Implement pure inventory consumption logic that validates required ingredients before returning an updated inventory.
5. Build small React components for inventory entry, inventory list, recommendation list, and cook action.
6. Wire the complete loop in `App.tsx` using local state.
7. Add focused tests for recommendation and inventory consumption logic.
8. Run lint and build, then adjust any TypeScript or UI issues.
