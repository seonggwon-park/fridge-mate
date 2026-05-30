import type { RecipeIngredient, Unit } from "./types";

export function aggregateRecipeIngredients(
  recipeIngredients: RecipeIngredient[],
): RecipeIngredient[] {
  const mergedIngredients = new Map<string, RecipeIngredient>();

  for (const recipeIngredient of recipeIngredients) {
    const key = getIngredientUnitKey(
      recipeIngredient.name,
      recipeIngredient.unit,
    );
    const existingIngredient = mergedIngredients.get(key);

    if (existingIngredient) {
      mergedIngredients.set(key, {
        ...existingIngredient,
        quantity: existingIngredient.quantity + recipeIngredient.quantity,
      });
    } else {
      mergedIngredients.set(key, { ...recipeIngredient });
    }
  }

  return [...mergedIngredients.values()];
}

export function getIngredientUnitKey(name: string, unit: Unit): string {
  return `${name.trim().toLocaleLowerCase("ko-KR")}::${unit}`;
}
