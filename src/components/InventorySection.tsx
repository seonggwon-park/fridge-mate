import { useState } from "react";
import type { FormEvent } from "react";
import type { Ingredient, StorageType, Unit } from "../domain/types";

const units: Unit[] = [
  "g",
  "ml",
  "ea",
  "pack",
  "slice",
  "serving",
  "tbsp",
  "tsp",
];

const storageTypes: StorageType[] = ["fridge", "freezer", "pantry", "room"];

const storageTypeLabels: Record<StorageType, string> = {
  fridge: "냉장",
  freezer: "냉동",
  pantry: "상온 보관",
  room: "실온",
};

interface InventorySectionProps {
  inventory: Ingredient[];
  today: string;
  onAddIngredient: (ingredient: Ingredient) => void;
  onDeleteIngredient: (ingredientId: string) => void;
}

export function InventorySection({
  inventory,
  today,
  onAddIngredient,
  onDeleteIngredient,
}: InventorySectionProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<Unit>("g");
  const [storageType, setStorageType] = useState<StorageType>("fridge");
  const [expiryDate, setExpiryDate] = useState(today);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedQuantity = Number(quantity);
    const trimmedName = name.trim();

    if (!trimmedName || parsedQuantity <= 0 || !expiryDate) {
      return;
    }

    onAddIngredient({
      id: crypto.randomUUID(),
      name: trimmedName,
      quantity: parsedQuantity,
      unit,
      storageType,
      expiryDate,
    });

    setName("");
    setQuantity("1");
    setUnit("g");
    setStorageType("fridge");
    setExpiryDate(today);
  }

  return (
    <section className="workspace-section inventory-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Inventory</p>
          <h2>냉장고 재료</h2>
        </div>
        <span className="section-count">{inventory.length} items</span>
      </div>

      <form className="ingredient-form" onSubmit={handleSubmit}>
        <label>
          재료명
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="예: 양파"
          />
        </label>

        <label>
          수량
          <input
            min="0"
            step="0.1"
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </label>

        <label>
          단위
          <select
            value={unit}
            onChange={(event) => setUnit(event.target.value as Unit)}
          >
            {units.map((unitOption) => (
              <option key={unitOption} value={unitOption}>
                {unitOption}
              </option>
            ))}
          </select>
        </label>

        <label>
          보관
          <select
            value={storageType}
            onChange={(event) =>
              setStorageType(event.target.value as StorageType)
            }
          >
            {storageTypes.map((storageTypeOption) => (
              <option key={storageTypeOption} value={storageTypeOption}>
                {storageTypeLabels[storageTypeOption]}
              </option>
            ))}
          </select>
        </label>

        <label>
          소비기한
          <input
            type="date"
            value={expiryDate}
            onChange={(event) => setExpiryDate(event.target.value)}
          />
        </label>

        <button type="submit" className="primary-action">
          추가
        </button>
      </form>

      <div className="inventory-list">
        {inventory.map((ingredient) => {
          const daysUntilExpiry = getDaysUntilExpiry(
            ingredient.expiryDate,
            today,
          );
          const isUrgent = daysUntilExpiry >= 0 && daysUntilExpiry <= 3;

          return (
            <article
              className={`ingredient-row ${isUrgent ? "is-urgent" : ""}`}
              key={ingredient.id}
            >
              <div className="ingredient-main">
                <strong>{ingredient.name}</strong>
                <span>
                  {ingredient.quantity}
                  {ingredient.unit}
                </span>
              </div>

              <dl className="ingredient-meta">
                <div>
                  <dt>보관</dt>
                  <dd>{storageTypeLabels[ingredient.storageType]}</dd>
                </div>
                <div>
                  <dt>소비기한</dt>
                  <dd>{ingredient.expiryDate}</dd>
                </div>
                <div>
                  <dt>남은 날</dt>
                  <dd>{formatDaysUntilExpiry(daysUntilExpiry)}</dd>
                </div>
              </dl>

              <button
                type="button"
                className="secondary-action"
                onClick={() => onDeleteIngredient(ingredient.id)}
              >
                삭제
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function getDaysUntilExpiry(expiryDate: string, today: string): number {
  return toUtcDay(expiryDate) - toUtcDay(today);
}

function formatDaysUntilExpiry(daysUntilExpiry: number): string {
  if (daysUntilExpiry < 0) {
    return `${Math.abs(daysUntilExpiry)}일 지남`;
  }

  if (daysUntilExpiry === 0) {
    return "오늘";
  }

  return `${daysUntilExpiry}일`;
}

function toUtcDay(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);

  return Date.UTC(year, month - 1, day) / 86_400_000;
}
