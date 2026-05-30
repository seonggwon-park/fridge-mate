import type {
  ConsumeIngredientsResult,
  Ingredient,
  MissingIngredient,
  Recipe,
  RecipeIngredient,
  Unit,
} from "./types";
import { aggregateRecipeIngredients } from "./recipeIngredients";

interface IngredientAvailability {
  availableQuantity: number;
  hasSameNameDifferentUnit: boolean;
}

export function consumeIngredients(
  recipe: Recipe,
  inventory: Ingredient[],
): ConsumeIngredientsResult {
  const missingIngredients = getMissingIngredients(recipe, inventory);
  const inventoryCopy = inventory.map((ingredient) => ({ ...ingredient }));

  if (missingIngredients.length > 0) {
    return {
      success: false,
      error: "Inventory does not have enough ingredients for this recipe.",
      inventory: inventoryCopy,
      missingIngredients,
    };
  }

  const consumedInventory = aggregateRecipeIngredients(
    recipe.ingredients,
  ).reduce(
    consumeRecipeIngredient,
    inventoryCopy,
  );

  return {
    success: true,
    inventory: consumedInventory.filter(
      (ingredient) => ingredient.quantity > 0,
    ),
  };
}

function consumeRecipeIngredient(
  inventory: Ingredient[],
  requiredIngredient: RecipeIngredient,
): Ingredient[] {
  let remainingQuantity = requiredIngredient.quantity;
  const matchingInventory = inventory
    .map((ingredient, index) => ({ ingredient, index }))
    .filter(
      ({ ingredient }) =>
        isSameIngredient(ingredient, requiredIngredient.name) &&
        ingredient.unit === requiredIngredient.unit &&
        ingredient.quantity > 0,
    )
    .sort(
      (left, right) =>
        left.ingredient.expiryDate.localeCompare(
          right.ingredient.expiryDate,
        ) || left.index - right.index,
    );

  for (const { ingredient, index } of matchingInventory) {
    if (remainingQuantity <= 0) {
      break;
    }

    const consumedQuantity = Math.min(
      ingredient.quantity,
      remainingQuantity,
    );
    remainingQuantity -= consumedQuantity;
    inventory[index] = {
      ...ingredient,
      quantity: ingredient.quantity - consumedQuantity,
    };
  }

  return inventory;
}

function getMissingIngredients(
  recipe: Recipe,
  inventory: Ingredient[],
): MissingIngredient[] {
  return aggregateRecipeIngredients(recipe.ingredients).flatMap(
    (requiredIngredient) => {
      const availability = getIngredientAvailability(
        requiredIngredient.name,
        requiredIngredient.unit,
        inventory,
      );

      if (availability.availableQuantity >= requiredIngredient.quantity) {
        return [];
      }

      return [
        buildMissingIngredient(
          requiredIngredient.name,
          requiredIngredient.quantity,
          requiredIngredient.unit,
          availability,
        ),
      ];
    },
  );
}

function getIngredientAvailability(
  ingredientName: string,
  unit: Unit,
  inventory: Ingredient[],
): IngredientAvailability {
  let availableQuantity = 0;
  let hasSameNameDifferentUnit = false;

  for (const ingredient of inventory) {
    if (!isSameIngredient(ingredient, ingredientName)) {
      continue;
    }

    if (ingredient.unit === unit) {
      availableQuantity += ingredient.quantity;
    } else {
      hasSameNameDifferentUnit = true;
    }
  }

  return { availableQuantity, hasSameNameDifferentUnit };
}

function buildMissingIngredient(
  name: string,
  requiredQuantity: number,
  unit: Unit,
  availability: IngredientAvailability,
): MissingIngredient {
  if (availability.availableQuantity > 0) {
    return {
      name,
      requiredQuantity,
      availableQuantity: availability.availableQuantity,
      unit,
      reason: "insufficient_quantity",
    };
  }

  if (availability.hasSameNameDifferentUnit) {
    return {
      name,
      requiredQuantity,
      availableQuantity: 0,
      unit,
      reason: "unit_mismatch",
    };
  }

  return {
    name,
    requiredQuantity,
    availableQuantity: 0,
    unit,
    reason: "missing",
  };
}

function isSameIngredient(
  ingredient: Ingredient,
  ingredientName: string,
): boolean {
  return (
    normalizeIngredientName(ingredient.name) ===
    normalizeIngredientName(ingredientName)
  );
}

function normalizeIngredientName(name: string): string {
  return name.trim().toLocaleLowerCase("ko-KR");
}
