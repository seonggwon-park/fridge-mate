import type {
  Ingredient,
  MissingIngredient,
  Recipe,
  RecommendationResult,
  Unit,
} from "./types";

const expiryUrgencyWindowDays = 3;
const expiryUrgencyScoreWeight = 5;
const missingIngredientPenaltyWeight = 10;
const millisecondsPerDay = 24 * 60 * 60 * 1000;

interface IngredientAvailability {
  availableQuantity: number;
  hasSameNameDifferentUnit: boolean;
}

interface ExpiryUrgencyResult {
  expiryUrgency: number;
  usedExpiringIngredientNames: string[];
  mostUrgentIngredient: ExpiringIngredientUsage | null;
}

interface ExpiringIngredientUsage {
  name: string;
  daysUntilExpiry: number;
}

export function recommendRecipes(
  recipes: Recipe[],
  inventory: Ingredient[],
  today: string | Date,
): RecommendationResult[] {
  return recipes
    .map((recipe) => scoreRecipe(recipe, inventory, today))
    .sort(compareRecommendations);
}

export function scoreRecipe(
  recipe: Recipe,
  inventory: Ingredient[],
  today: string | Date,
): RecommendationResult {
  const missingIngredients: MissingIngredient[] = [];
  let totalFulfillmentRate = 0;

  for (const requiredIngredient of recipe.ingredients) {
    const availability = getIngredientAvailability(
      requiredIngredient.name,
      requiredIngredient.unit,
      inventory,
    );

    if (availability.availableQuantity >= requiredIngredient.quantity) {
      totalFulfillmentRate += 1;
      continue;
    }

    totalFulfillmentRate += Math.min(
      availability.availableQuantity / requiredIngredient.quantity,
      1,
    );

    missingIngredients.push(
      buildMissingIngredient(
        requiredIngredient.name,
        requiredIngredient.quantity,
        requiredIngredient.unit,
        availability,
      ),
    );
  }

  const matchRate =
    recipe.ingredients.length === 0
      ? 1
      : totalFulfillmentRate / recipe.ingredients.length;
  const canCook = missingIngredients.length === 0;
  const expiryUrgencyResult = calculateExpiryUrgency(
    recipe,
    inventory,
    today,
  );
  const matchScore = matchRate * 100;
  const expiryUrgencyBonus =
    expiryUrgencyResult.expiryUrgency * expiryUrgencyScoreWeight;
  const missingIngredientPenalty =
    missingIngredients.length * missingIngredientPenaltyWeight;
  const score = matchScore + expiryUrgencyBonus - missingIngredientPenalty;

  return {
    recipe,
    canCook,
    score,
    matchRate,
    expiryUrgency: expiryUrgencyResult.expiryUrgency,
    explanation: buildRecommendationExplanation(
      canCook,
      missingIngredients,
      expiryUrgencyResult.mostUrgentIngredient,
    ),
    missingIngredients,
    usedExpiringIngredientNames:
      expiryUrgencyResult.usedExpiringIngredientNames,
    scoreBreakdown: {
      matchScore,
      expiryUrgencyBonus,
      missingIngredientPenalty,
    },
  };
}

function compareRecommendations(
  left: RecommendationResult,
  right: RecommendationResult,
): number {
  if (left.canCook !== right.canCook) {
    return left.canCook ? -1 : 1;
  }

  return (
    right.score - left.score ||
    right.expiryUrgency - left.expiryUrgency ||
    right.matchRate - left.matchRate ||
    left.missingIngredients.length - right.missingIngredients.length ||
    left.recipe.name.localeCompare(right.recipe.name, "ko-KR")
  );
}

function getIngredientAvailability(
  ingredientName: string,
  unit: Unit,
  inventory: Ingredient[],
): IngredientAvailability {
  const normalizedName = normalizeIngredientName(ingredientName);
  let availableQuantity = 0;
  let hasSameNameDifferentUnit = false;

  for (const ingredient of inventory) {
    if (normalizeIngredientName(ingredient.name) !== normalizedName) {
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

function calculateExpiryUrgency(
  recipe: Recipe,
  inventory: Ingredient[],
  today: string | Date,
): ExpiryUrgencyResult {
  const todayDay = toUtcDay(today);
  const expiringIngredientUsages: ExpiringIngredientUsage[] = [];
  let expiryUrgency = 0;

  for (const requiredIngredient of recipe.ingredients) {
    const normalizedRequiredName = normalizeIngredientName(
      requiredIngredient.name,
    );
    let closestDaysUntilExpiry: number | null = null;

    for (const ingredient of inventory) {
      const isSameIngredient =
        normalizeIngredientName(ingredient.name) === normalizedRequiredName &&
        ingredient.unit === requiredIngredient.unit &&
        ingredient.quantity > 0;

      if (!isSameIngredient) {
        continue;
      }

      const daysUntilExpiry = toUtcDay(ingredient.expiryDate) - todayDay;

      if (
        daysUntilExpiry >= 0 &&
        daysUntilExpiry <= expiryUrgencyWindowDays
      ) {
        closestDaysUntilExpiry = Math.min(
          closestDaysUntilExpiry ?? daysUntilExpiry,
          daysUntilExpiry,
        );
      }
    }

    if (closestDaysUntilExpiry !== null) {
      expiryUrgency +=
        expiryUrgencyWindowDays - closestDaysUntilExpiry + 1;
      expiringIngredientUsages.push({
        name: requiredIngredient.name,
        daysUntilExpiry: closestDaysUntilExpiry,
      });
    }
  }

  expiringIngredientUsages.sort(
    (left, right) =>
      left.daysUntilExpiry - right.daysUntilExpiry ||
      left.name.localeCompare(right.name, "ko-KR"),
  );

  return {
    expiryUrgency,
    usedExpiringIngredientNames: expiringIngredientUsages.map(
      (ingredient) => ingredient.name,
    ),
    mostUrgentIngredient: expiringIngredientUsages[0] ?? null,
  };
}

function buildRecommendationExplanation(
  canCook: boolean,
  missingIngredients: MissingIngredient[],
  mostUrgentIngredient: ExpiringIngredientUsage | null,
): string {
  const explanationParts: string[] = [];

  if (mostUrgentIngredient) {
    explanationParts.push(
      `${mostUrgentIngredient.name} 유통기한이 ${formatDaysUntilExpiry(
        mostUrgentIngredient.daysUntilExpiry,
      )} 우선 추천했어요.`,
    );
  }

  if (canCook) {
    explanationParts.push("지금 가진 재료로 바로 만들 수 있어요.");
  } else if (missingIngredients.length === 1) {
    explanationParts.push(
      `${missingIngredients[0].name}만 있으면 만들 수 있어요.`,
    );
  } else {
    const visibleIngredientNames = missingIngredients
      .slice(0, 2)
      .map((ingredient) => ingredient.name)
      .join(", ");

    explanationParts.push(
      `${visibleIngredientNames} 등 ${missingIngredients.length}개 재료가 부족해요.`,
    );
  }

  return explanationParts.join(" ");
}

function formatDaysUntilExpiry(daysUntilExpiry: number): string {
  if (daysUntilExpiry === 0) {
    return "오늘까지라서";
  }

  return `${daysUntilExpiry}일 남아서`;
}

function normalizeIngredientName(name: string): string {
  return name.trim().toLocaleLowerCase("ko-KR");
}

function toUtcDay(value: string | Date): number {
  if (value instanceof Date) {
    return Math.floor(
      Date.UTC(
        value.getUTCFullYear(),
        value.getUTCMonth(),
        value.getUTCDate(),
      ) / millisecondsPerDay,
    );
  }

  const [year, month, day] = value.split("-").map(Number);

  return Math.floor(Date.UTC(year, month - 1, day) / millisecondsPerDay);
}
