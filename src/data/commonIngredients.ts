import type { Unit } from "../domain/types";

export interface CommonIngredient {
  name: string;
  unit: Unit;
  unitLabel: string;
  expiryDays: number;
}

export const commonIngredients: CommonIngredient[] = [
  { name: "계란", unit: "ea", unitLabel: "개", expiryDays: 14 },
  { name: "우유", unit: "ml", unitLabel: "ml", expiryDays: 7 },
  { name: "김치", unit: "g", unitLabel: "g", expiryDays: 30 },
  { name: "닭가슴살", unit: "g", unitLabel: "g", expiryDays: 5 },
  { name: "두부", unit: "pack", unitLabel: "팩", expiryDays: 5 },
  { name: "참치캔", unit: "ea", unitLabel: "캔", expiryDays: 365 },
  { name: "샐러드채소", unit: "g", unitLabel: "g", expiryDays: 3 },
  { name: "밥", unit: "serving", unitLabel: "인분", expiryDays: 2 },
  { name: "라면", unit: "pack", unitLabel: "봉지", expiryDays: 180 },
  { name: "식빵", unit: "slice", unitLabel: "장", expiryDays: 5 },
  { name: "파스타면", unit: "g", unitLabel: "g", expiryDays: 365 },
  { name: "만두", unit: "g", unitLabel: "g", expiryDays: 90 },
  { name: "대파", unit: "g", unitLabel: "g", expiryDays: 7 },
  { name: "양파", unit: "g", unitLabel: "g", expiryDays: 21 },
  { name: "마늘", unit: "g", unitLabel: "g", expiryDays: 30 },
  { name: "상추", unit: "g", unitLabel: "g", expiryDays: 3 },
  { name: "소면", unit: "g", unitLabel: "g", expiryDays: 365 },
  { name: "우동면", unit: "pack", unitLabel: "팩", expiryDays: 10 },
  { name: "간장", unit: "tbsp", unitLabel: "큰술", expiryDays: 365 },
  { name: "고추장", unit: "tbsp", unitLabel: "큰술", expiryDays: 180 },
  { name: "된장", unit: "tbsp", unitLabel: "큰술", expiryDays: 180 },
  { name: "마요네즈", unit: "tbsp", unitLabel: "큰술", expiryDays: 30 },
  { name: "케첩", unit: "tbsp", unitLabel: "큰술", expiryDays: 60 },
  { name: "토마토소스", unit: "g", unitLabel: "g", expiryDays: 7 },
  { name: "부침가루", unit: "g", unitLabel: "g", expiryDays: 180 },
];

export function findCommonIngredient(
  ingredientName: string,
): CommonIngredient | null {
  const normalizedIngredientName = normalizeIngredientName(ingredientName);

  return (
    commonIngredients.find(
      (ingredient) =>
        normalizeIngredientName(ingredient.name) ===
        normalizedIngredientName,
    ) ?? null
  );
}

export function getSuggestedExpiryDate(
  ingredientName: string,
  today: string,
): string | null {
  const commonIngredient = findCommonIngredient(ingredientName);

  if (!commonIngredient) {
    return null;
  }

  return addDaysToDateKey(today, commonIngredient.expiryDays);
}

export function getUnitLabel(unit: Unit, ingredientName?: string): string {
  if (ingredientName) {
    const commonIngredient = findCommonIngredient(ingredientName);

    if (commonIngredient?.unit === unit) {
      return commonIngredient.unitLabel;
    }
  }

  return unitLabels[unit];
}

function addDaysToDateKey(dateKey: string, daysToAdd: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + daysToAdd));

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function normalizeIngredientName(ingredientName: string): string {
  return ingredientName.trim().toLocaleLowerCase("ko-KR");
}

const unitLabels: Record<Unit, string> = {
  g: "g",
  ml: "ml",
  ea: "개",
  pack: "팩",
  slice: "장",
  serving: "인분",
  tbsp: "큰술",
  tsp: "작은술",
};
