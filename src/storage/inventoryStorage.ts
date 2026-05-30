import type { Ingredient, StorageType, Unit } from "../domain/types";

const inventoryStorageKey = "fridge-mate.inventory.v1";

const validUnits: Unit[] = [
  "g",
  "ml",
  "ea",
  "pack",
  "slice",
  "serving",
  "tbsp",
  "tsp",
];

const validStorageTypes: StorageType[] = [
  "fridge",
  "freezer",
  "pantry",
  "room",
];

export function loadInventoryFromStorage(): Ingredient[] | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  try {
    const storedInventory = window.localStorage.getItem(inventoryStorageKey);

    if (!storedInventory) {
      return null;
    }

    const parsedInventory: unknown = JSON.parse(storedInventory);

    if (!isIngredientArray(parsedInventory)) {
      removeStoredInventory();
      return null;
    }

    return parsedInventory.map((ingredient) => ({ ...ingredient }));
  } catch {
    removeStoredInventory();
    return null;
  }
}

export function saveInventoryToStorage(inventory: Ingredient[]): void {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(
      inventoryStorageKey,
      JSON.stringify(inventory),
    );
  } catch {
    // localStorage can fail in private browsing or when quota is exceeded.
  }
}

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && "localStorage" in window;
}

function removeStoredInventory(): void {
  try {
    window.localStorage.removeItem(inventoryStorageKey);
  } catch {
    // Ignore cleanup failures; falling back to sample data is enough.
  }
}

function isIngredientArray(value: unknown): value is Ingredient[] {
  return Array.isArray(value) && value.every(isIngredient);
}

function isIngredient(value: unknown): value is Ingredient {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    typeof value.quantity === "number" &&
    Number.isFinite(value.quantity) &&
    value.quantity > 0 &&
    isUnit(value.unit) &&
    isStorageType(value.storageType) &&
    typeof value.expiryDate === "string" &&
    isDateKey(value.expiryDate)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUnit(value: unknown): value is Unit {
  return (
    typeof value === "string" && validUnits.includes(value as Unit)
  );
}

function isStorageType(value: unknown): value is StorageType {
  return (
    typeof value === "string" &&
    validStorageTypes.includes(value as StorageType)
  );
}

function isDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsedDate = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day
  );
}
