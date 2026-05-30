import { useEffect, useMemo, useState } from "react";
import { CookingConfirmationModal } from "./components/CookingConfirmationModal";
import { InventorySection } from "./components/InventorySection";
import { RecipeRecommendations } from "./components/RecipeRecommendations";
import { sampleIngredients } from "./data/sampleIngredients";
import { sampleRecipes } from "./data/sampleRecipes";
import { consumeIngredients } from "./domain/inventory";
import { recommendRecipes } from "./domain/recipeScoring";
import type { Ingredient, Recipe } from "./domain/types";
import {
  loadInventoryFromStorage,
  saveInventoryToStorage,
} from "./storage/inventoryStorage";
import "./App.css";

interface StatusMessage {
  tone: "success" | "error";
  text: string;
}

function App() {
  const [today] = useState(getTodayDateKey);
  const [inventory, setInventory] = useState<Ingredient[]>(
    getInitialInventory,
  );
  const [statusMessage, setStatusMessage] =
    useState<StatusMessage | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    saveInventoryToStorage(inventory);
  }, [inventory]);

  const recommendations = useMemo(
    () => recommendRecipes(sampleRecipes, inventory, today),
    [inventory, today],
  );

  function handleAddIngredient(ingredient: Ingredient) {
    setInventory((currentInventory) => [...currentInventory, ingredient]);
    setStatusMessage({
      tone: "success",
      text: `${ingredient.name}을(를) 냉장고에 추가했어요.`,
    });
  }

  function handleDeleteIngredient(ingredientId: string) {
    setInventory((currentInventory) =>
      currentInventory.filter((ingredient) => ingredient.id !== ingredientId),
    );
    setStatusMessage(null);
  }

  function handleResetDemoData() {
    setInventory(sampleIngredients.map((ingredient) => ({ ...ingredient })));
    setStatusMessage({
      tone: "success",
      text: "Demo inventory restored.",
    });
  }

  function handleSelectRecipe(recipe: Recipe) {
    setSelectedRecipe(recipe);
    setStatusMessage(null);
  }

  function handleCancelCooking() {
    setSelectedRecipe(null);
  }

  function handleConfirmCooking() {
    if (!selectedRecipe) {
      return;
    }

    const recipe = selectedRecipe;
    const result = consumeIngredients(recipe, inventory);

    if (result.success) {
      setInventory(result.inventory);
      setSelectedRecipe(null);
      setStatusMessage({
        tone: "success",
        text: `${recipe.name} 조리 완료. 사용한 재료를 차감했어요.`,
      });
      return;
    }

    setStatusMessage({
      tone: "error",
      text: result.error,
    });
    setSelectedRecipe(null);
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">FridgeMate MVP</p>
          <h1>먹을 수 있는 메뉴부터 바로 고르기</h1>
        </div>
        <div className="header-actions">
          <div className="today-badge">오늘 {today}</div>
          <button
            type="button"
            className="secondary-action"
            onClick={handleResetDemoData}
          >
            데모 재료 초기화
          </button>
        </div>
      </header>

      {statusMessage ? (
        <div className={`status-message ${statusMessage.tone}`}>
          {statusMessage.text}
        </div>
      ) : null}

      <div className="workspace-grid">
        <InventorySection
          inventory={inventory}
          today={today}
          onAddIngredient={handleAddIngredient}
          onDeleteIngredient={handleDeleteIngredient}
        />
        <RecipeRecommendations
          recommendations={recommendations}
          onCookRecipe={handleSelectRecipe}
        />
      </div>

      {selectedRecipe ? (
        <CookingConfirmationModal
          recipe={selectedRecipe}
          inventory={inventory}
          onConfirm={handleConfirmCooking}
          onCancel={handleCancelCooking}
        />
      ) : null}
    </main>
  );
}

function getTodayDateKey(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getInitialInventory(): Ingredient[] {
  return (
    loadInventoryFromStorage() ??
    sampleIngredients.map((ingredient) => ({ ...ingredient }))
  );
}

export default App;
