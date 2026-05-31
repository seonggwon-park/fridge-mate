import { useEffect, useRef } from "react";
import { getUnitLabel } from "../data/commonIngredients";
import type { Recipe, RecommendationResult } from "../domain/types";

interface RecipeDetailModalProps {
  recommendation: RecommendationResult;
  onClose: () => void;
  onCookRecipe: (recipe: Recipe) => void;
}

export function RecipeDetailModal({
  recommendation,
  onClose,
  onCookRecipe,
}: RecipeDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { recipe } = recommendation;

  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        aria-labelledby="recipe-detail-title"
        aria-modal="true"
        className="recipe-detail-modal"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            onClose();
          }
        }}
        ref={modalRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="recipe-detail-topline">
          <div className="modal-heading">
            <p className="eyebrow">Recipe detail</p>
            <h2 id="recipe-detail-title">{recipe.name}</h2>
            <p>{recipe.description}</p>
          </div>
          <button
            type="button"
            className="secondary-action modal-close-action"
            onClick={onClose}
          >
            닫기
          </button>
        </div>

        <div className="recipe-detail-meta" aria-label="레시피 정보">
          <span>{recipe.cookTimeMinutes}분</span>
          <span>{recipe.servings}인분</span>
          {recipe.difficulty ? <span>{recipe.difficulty}</span> : null}
        </div>

        <section className="recipe-detail-section">
          <h3>필요 재료</h3>
          <ul className="ingredient-chip-list">
            {recipe.ingredients.map((ingredient) => (
              <li key={`${ingredient.name}-${ingredient.unit}`}>
                {ingredient.name} {ingredient.quantity}
                {getUnitLabel(ingredient.unit, ingredient.name)}
              </li>
            ))}
          </ul>
        </section>

        {recommendation.missingIngredients.length > 0 ? (
          <section className="recipe-detail-section">
            <h3>부족한 재료</h3>
            <ul className="ingredient-chip-list missing-chip-list">
              {recommendation.missingIngredients.map((ingredient) => (
                <li key={`${ingredient.name}-${ingredient.unit}`}>
                  {ingredient.name} {ingredient.requiredQuantity}
                  {getUnitLabel(ingredient.unit, ingredient.name)}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="recipe-detail-section">
          <h3>추천 이유</h3>
          <p className="recommendation-explanation">
            {recommendation.explanation}
          </p>
        </section>

        <section className="recipe-detail-section">
          <h3>만드는 법</h3>
          <ol className="recipe-step-list">
            {recipe.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-action"
            onClick={onClose}
          >
            닫기
          </button>
          {recommendation.canCook ? (
            <button
              type="button"
              className="primary-action"
              onClick={() => onCookRecipe(recipe)}
            >
              요리하기
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
