export type StorageType = "fridge" | "freezer" | "pantry" | "room";

export type Unit =
  | "g"
  | "ml"
  | "ea"
  | "pack"
  | "slice"
  | "serving"
  | "tbsp"
  | "tsp";

export type MissingIngredientReason =
  | "missing"
  | "insufficient_quantity"
  | "unit_mismatch";

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  storageType: StorageType;
  expiryDate: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: Unit;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  servings: number;
  cookTimeMinutes: number;
  ingredients: RecipeIngredient[];
  tags: string[];
}

export interface MissingIngredient {
  name: string;
  requiredQuantity: number;
  availableQuantity: number;
  unit: Unit;
  reason: MissingIngredientReason;
}

export interface ScoreBreakdown {
  matchScore: number;
  expiryUrgencyBonus: number;
  missingIngredientPenalty: number;
}

export interface RecommendationResult {
  recipe: Recipe;
  canCook: boolean;
  score: number;
  matchRate: number;
  expiryUrgency: number;
  explanation: string;
  missingIngredients: MissingIngredient[];
  usedExpiringIngredientNames: string[];
  scoreBreakdown: ScoreBreakdown;
}

export type ConsumeIngredientsResult =
  | {
      success: true;
      inventory: Ingredient[];
    }
  | {
      success: false;
      error: string;
      inventory: Ingredient[];
      missingIngredients: MissingIngredient[];
    };
