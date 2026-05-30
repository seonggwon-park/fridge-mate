import { useEffect, useRef } from "react";
import { consumeIngredients } from "../domain/inventory";
import type { Ingredient, Recipe, RecipeIngredient } from "../domain/types";

interface CookingConfirmationModalProps {
  recipe: Recipe;
  inventory: Ingredient[];
  onConfirm: () => void;
  onCancel: () => void;
}

interface ConsumptionPreviewRow {
  name: string;
  unit: string;
  requiredQuantity: number;
  currentQuantity: number;
  quantityAfterCooking: number;
}

export function CookingConfirmationModal({
  recipe,
  inventory,
  onConfirm,
  onCancel,
}: CookingConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previewRows = buildConsumptionPreview(recipe, inventory);

  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        aria-labelledby="cook-modal-title"
        aria-modal="true"
        className="cook-modal"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            onCancel();
          }
        }}
        ref={modalRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="modal-heading">
          <p className="eyebrow">Cooking check</p>
          <h2 id="cook-modal-title">{recipe.name}</h2>
          <p>요리하면 아래 재료가 차감돼요.</p>
        </div>

        <div className="consumption-table" role="table">
          <div className="consumption-row consumption-header" role="row">
            <span role="columnheader">재료</span>
            <span role="columnheader">현재</span>
            <span role="columnheader">조리 후</span>
          </div>

          {previewRows.map((row) => (
            <div
              className="consumption-row"
              key={`${row.name}-${row.unit}`}
              role="row"
            >
              <span role="cell">
                {row.name} {row.requiredQuantity}
                {row.unit}
              </span>
              <span role="cell">
                {row.currentQuantity}
                {row.unit}
              </span>
              <span role="cell">
                {row.quantityAfterCooking}
                {row.unit}
              </span>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-action"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className="primary-action"
            onClick={onConfirm}
          >
            확인하고 요리하기
          </button>
        </div>
      </div>
    </div>
  );
}

function buildConsumptionPreview(
  recipe: Recipe,
  inventory: Ingredient[],
): ConsumptionPreviewRow[] {
  const result = consumeIngredients(recipe, inventory);
  const inventoryAfterCooking = result.success ? result.inventory : inventory;

  return mergeRecipeIngredients(recipe.ingredients).map(
    (requiredIngredient) => ({
      name: requiredIngredient.name,
      unit: requiredIngredient.unit,
      requiredQuantity: requiredIngredient.quantity,
      currentQuantity: getInventoryQuantity(
        inventory,
        requiredIngredient.name,
        requiredIngredient.unit,
      ),
      quantityAfterCooking: getInventoryQuantity(
        inventoryAfterCooking,
        requiredIngredient.name,
        requiredIngredient.unit,
      ),
    }),
  );
}

function mergeRecipeIngredients(
  recipeIngredients: RecipeIngredient[],
): RecipeIngredient[] {
  const mergedIngredients = new Map<string, RecipeIngredient>();

  for (const recipeIngredient of recipeIngredients) {
    const key = getIngredientKey(
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

function getInventoryQuantity(
  inventory: Ingredient[],
  ingredientName: string,
  unit: string,
): number {
  return inventory
    .filter(
      (ingredient) =>
        getIngredientKey(ingredient.name, ingredient.unit) ===
        getIngredientKey(ingredientName, unit),
    )
    .reduce((totalQuantity, ingredient) => {
      return totalQuantity + ingredient.quantity;
    }, 0);
}

function getIngredientKey(name: string, unit: string): string {
  return `${name.trim().toLocaleLowerCase("ko-KR")}::${unit}`;
}
