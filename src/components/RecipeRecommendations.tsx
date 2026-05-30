import type { Recipe, RecommendationResult } from "../domain/types";

interface RecipeRecommendationsProps {
  recommendations: RecommendationResult[];
  onCookRecipe: (recipe: Recipe) => void;
}

export function RecipeRecommendations({
  recommendations,
  onCookRecipe,
}: RecipeRecommendationsProps) {
  return (
    <section className="workspace-section recommendations-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Recommendations</p>
          <h2>오늘 만들 수 있는 메뉴</h2>
        </div>
        <span className="section-count">{recommendations.length} recipes</span>
      </div>

      <div className="recipe-list">
        {recommendations.map((recommendation) => (
          <article className="recipe-card" key={recommendation.recipe.id}>
            <div className="recipe-card-header">
              <div>
                <h3>{recommendation.recipe.name}</h3>
                <p>{recommendation.recipe.description}</p>
              </div>
              <span
                className={`status-pill ${
                  recommendation.canCook ? "can-cook" : "needs-more"
                }`}
              >
                {recommendation.canCook ? "가능" : "부족"}
              </span>
            </div>

            <div className="recipe-stats">
              <span>매칭 {formatPercent(recommendation.matchRate)}</span>
              <span>점수 {Math.round(recommendation.score)}</span>
              <span>{recommendation.recipe.cookTimeMinutes}분</span>
            </div>

            <p
              className={`recommendation-explanation ${
                recommendation.expiryUrgency > 0 ? "urgency-note" : ""
              }`}
            >
              {recommendation.explanation}
            </p>

            {recommendation.missingIngredients.length > 0 ? (
              <div className="missing-ingredients">
                <span>부족한 재료</span>
                <ul>
                  {recommendation.missingIngredients.map(
                    (missingIngredient) => (
                      <li
                        key={`${recommendation.recipe.id}-${missingIngredient.name}`}
                      >
                        {missingIngredient.name}{" "}
                        {missingIngredient.requiredQuantity}
                        {missingIngredient.unit}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ) : null}

            {recommendation.canCook ? (
              <button
                type="button"
                className="primary-action cook-action"
                onClick={() => onCookRecipe(recommendation.recipe)}
              >
                Cook this
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
