import { useMemo, useState } from "react";
import { InventorySection } from "./components/InventorySection";
import { RecipeRecommendations } from "./components/RecipeRecommendations";
import { sampleIngredients } from "./data/sampleIngredients";
import { sampleRecipes } from "./data/sampleRecipes";
import { consumeIngredients } from "./domain/inventory";
import { recommendRecipes } from "./domain/recipeScoring";
import type { Ingredient, Recipe } from "./domain/types";
import "./App.css";

interface StatusMessage {
  tone: "success" | "error";
  text: string;
}

function App() {
  const [today] = useState(getTodayDateKey);
  const [inventory, setInventory] = useState<Ingredient[]>(
    sampleIngredients,
  );
  const [statusMessage, setStatusMessage] =
    useState<StatusMessage | null>(null);

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

  function handleCookRecipe(recipe: Recipe) {
    const result = consumeIngredients(recipe, inventory);

    if (result.success) {
      setInventory(result.inventory);
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
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">FridgeMate MVP</p>
          <h1>먹을 수 있는 메뉴부터 바로 고르기</h1>
        </div>
        <div className="today-badge">Today {today}</div>
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
          onCookRecipe={handleCookRecipe}
        />
      </div>
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

export default App;
