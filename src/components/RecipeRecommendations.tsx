import type { Recipe, RecommendationResult } from "../domain/types";

interface RecipeRecommendationsProps {
  recommendations: RecommendationResult[];
  onCookRecipe: (recipe: Recipe) => void;
  onViewRecipe: (recommendation: RecommendationResult) => void;
}

export function RecipeRecommendations({
  recommendations,
  onCookRecipe,
  onViewRecipe,
}: RecipeRecommendationsProps) {
  const hasCookableRecipe = recommendations.some(
    (recommendation) => recommendation.canCook,
  );

  return (
    <section className="workspace-section recommendations-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Recommendations</p>
          <h2>오늘 만들 수 있는 메뉴</h2>
        </div>
        <span className="section-count">{recommendations.length}개</span>
      </div>

      <div className="recipe-list">
        {!hasCookableRecipe ? (
          <div className="empty-state">
            <strong>바로 만들 수 있는 메뉴가 아직 없어요.</strong>
            <span>부족한 재료를 하나만 추가해도 추천이 달라질 수 있어요.</span>
          </div>
        ) : null}

        {recommendations.map((recommendation) => (
          <article
            className={`recipe-card ${
              recommendation.canCook ? "can-cook-card" : ""
            }`}
            key={recommendation.recipe.id}
          >
            <div className="recipe-card-header">
              <div>
                <h3>{recommendation.recipe.name}</h3>
                <p>{recommendation.recipe.description}</p>
              </div>
              <span
                className={`badge status-pill ${
                  recommendation.canCook ? "can-cook" : "needs-more"
                }`}
              >
                {recommendation.canCook ? "바로 가능" : "재료 부족"}
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

            <div className="recipe-card-actions">
              <button
                type="button"
                className="secondary-action"
                onClick={() => onViewRecipe(recommendation)}
              >
                레시피 보기
              </button>

              {recommendation.canCook ? (
                <button
                  type="button"
                  className="primary-action cook-action"
                  onClick={() => onCookRecipe(recommendation.recipe)}
                >
                  요리하기
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
