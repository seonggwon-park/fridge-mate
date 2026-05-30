# FridgeMate

FridgeMate는 냉장고에 있는 재료를 바탕으로 지금 만들 수 있는 요리를 추천하고, 조리 후 재료 수량을 자동으로 차감하는 local-first 냉장고 관리 MVP입니다.

Demo: [https://fridge-mate-alpha.vercel.app/](https://fridge-mate-alpha.vercel.app/)

## 문제 정의

대학생, 1인 가구, 요리 초보자는 냉장고에 무엇이 있는지 잊기 쉽고, 소비기한이 임박한 재료를 제때 쓰지 못해 음식물 쓰레기가 생기기 쉽습니다. FridgeMate는 보유 재료를 입력하면 바로 만들 수 있는 메뉴를 추천하고, 소비기한이 가까운 재료를 우선 활용하도록 도와줍니다.

## 타깃 사용자

- 한국 대학생
- 혼자 사는 1인 가구
- 요리 초보자
- 식비와 음식물 쓰레기를 줄이고 싶은 사용자
- 냉장고 재료로 무엇을 먹을지 빠르게 결정하고 싶은 사용자

## 핵심 사용자 흐름

```text
inventory -> recommendation -> cook -> inventory update
```

1. 사용자가 현재 가진 재료를 입력합니다.
2. 앱이 로컬 샘플 레시피를 기준으로 추천 메뉴를 계산합니다.
3. 바로 만들 수 있는 레시피와 소비기한 임박 재료를 사용하는 레시피를 우선 보여줍니다.
4. 사용자가 요리하기를 누르면 확인 모달에서 차감될 재료를 확인합니다.
5. 조리를 확정하면 재료 수량이 차감되고 추천 목록이 다시 계산됩니다.

## 핵심 기능

- 냉장고 재료 추가, 삭제
- 재료명, 수량, 단위, 보관 방식, 소비기한 관리
- 한국 식재료 자동완성 및 기본 단위/소비기한 추천
- 소비기한 임박 재료 강조
- 로컬 샘플 레시피 기반 추천
- 추천 이유 설명
- 부족한 재료 표시
- 요리 전 확인 모달
- 조리 후 재료 수량 차감
- localStorage 기반 재료 목록 저장
- 데모 재료 초기화

## MVP 범위

현재 MVP에 포함되는 것:

- React 단일 화면 앱
- TypeScript 기반 명시적 도메인 타입
- 로컬 샘플 재료 데이터
- 로컬 샘플 레시피 데이터
- 순수 함수 기반 추천 로직
- 순수 함수 기반 재료 차감 로직
- localStorage 재료 목록 저장

현재 MVP에서 제외한 것:

- Authentication
- Backend
- Supabase 연동
- AI 추천
- 외부 recipe API
- Barcode scanning
- Image recognition
- 영수증 인식
- 단위 변환
- 재료 대체 추천

## Tech Stack

- React
- TypeScript
- Vite
- CSS
- localStorage
- Local static sample data

## Deployment

이 앱은 Vercel에 배포되어 있습니다.

- Demo: [https://fridge-mate-alpha.vercel.app/](https://fridge-mate-alpha.vercel.app/)

## Project Structure

```text
fridge-mate/
  AGENTS.md
  IMPLEMENTATION_PLAN.md
  README.md
  package.json
  src/
    App.tsx
    App.css
    index.css
    main.tsx
    components/
      CookingConfirmationModal.tsx
      InventorySection.tsx
      RecipeRecommendations.tsx
    data/
      commonIngredients.ts
      sampleIngredients.ts
      sampleRecipes.ts
    domain/
      inventory.ts
      recipeScoring.ts
      types.ts
    storage/
      inventoryStorage.ts
```

## 추천 로직 요약

추천 로직은 `src/domain/recipeScoring.ts`에 있습니다.

- 레시피의 모든 필수 재료가 같은 단위로 충분히 있으면 `canCook`이 `true`입니다.
- 보유 재료가 일부만 있으면 `matchRate`를 계산합니다.
- 부족한 재료는 `missingIngredients`로 반환합니다.
- 소비기한이 3일 이내인 재료를 사용하는 레시피에는 expiry urgency bonus를 부여합니다.
- 추천 결과는 다음 기준으로 정렬됩니다.
  1. 바로 만들 수 있는 레시피 우선
  2. 높은 score 우선
  3. 높은 expiry urgency 우선
  4. 높은 matchRate 우선
  5. 부족한 재료가 적은 레시피 우선

추천 결과에는 사용자가 이해할 수 있는 설명도 포함됩니다.

예시:

- `지금 가진 재료로 바로 만들 수 있어요.`
- `두부 유통기한이 오늘까지라서 우선 추천했어요.`
- `대파만 있으면 만들 수 있어요.`
- `계란, 대파 등 2개 재료가 부족해요.`

## 재료 차감 로직 요약

재료 차감 로직은 `src/domain/inventory.ts`에 있습니다.

- `consumeIngredients(recipe, inventory)`는 원본 inventory 배열을 변경하지 않습니다.
- 조리 전에 필요한 재료가 충분한지 검증합니다.
- 재료가 부족하면 명확한 실패 결과와 부족한 재료 목록을 반환합니다.
- 재료가 충분하면 필요한 수량만 차감한 새 inventory를 반환합니다.
- 수량이 0이 된 재료는 목록에서 제거됩니다.
- 같은 재료가 여러 개 있으면 소비기한이 빠른 항목부터 차감합니다.

## Persistence 요약

재료 목록 저장은 `src/storage/inventoryStorage.ts`에서 처리합니다.

- 앱 시작 시 localStorage에 저장된 inventory를 먼저 불러옵니다.
- 저장된 데이터가 없으면 `sampleIngredients`를 사용합니다.
- inventory가 변경될 때마다 localStorage에 저장합니다.
- localStorage 데이터가 손상되었거나 형식이 맞지 않으면 삭제하고 데모 데이터를 사용합니다.
- 레시피 데이터는 계속 로컬 정적 샘플 데이터로 유지됩니다.

## 로컬 실행 방법

```bash
npm install
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

브라우저에서 아래 주소를 엽니다.

```text
http://127.0.0.1:5173
```

빌드 확인:

```bash
npm run build
```

Lint 확인:

```bash
npm.cmd run lint
```

Windows PowerShell에서 `npm run lint`가 execution policy 문제로 막히면 `npm.cmd run lint`를 사용합니다.

## 수동 테스트 시나리오

1. 앱을 실행하고 냉장고 재료 섹션을 확인합니다.
2. 재료명 입력란에 `계란`, `두부`, `김치` 같은 알려진 재료를 입력하거나 자동완성에서 선택합니다.
3. 단위와 소비기한이 자동으로 추천되는지 확인합니다.
4. 단위 또는 소비기한을 직접 바꿔 manual override가 가능한지 확인합니다.
5. 재료를 추가하고 inventory 목록에 표시되는지 확인합니다.
6. 추천 레시피 목록에서 `바로 가능`, `재료 부족`, match rate, score를 확인합니다.
7. 추천 설명을 읽고 왜 추천되었는지 이해할 수 있는지 확인합니다.
8. 바로 가능한 레시피의 `요리하기` 버튼을 누릅니다.
9. 확인 모달에서 레시피 이름, 차감될 재료, 현재 수량, 조리 후 수량을 확인합니다.
10. `확인하고 요리하기`를 눌러 조리를 확정합니다.
11. inventory 수량이 줄어들고 추천 목록이 다시 계산되는지 확인합니다.
12. 페이지를 새로고침한 뒤 변경된 inventory가 localStorage로 유지되는지 확인합니다.
13. `데모 재료 초기화` 버튼을 눌러 sampleIngredients로 복원되는지 확인합니다.

## 현재 제한사항

- 데이터는 브라우저 localStorage에만 저장됩니다.
- 사용자 계정과 동기화가 없습니다.
- 레시피는 로컬 샘플 데이터만 사용합니다.
- 외부 recipe API를 사용하지 않습니다.
- AI 추천이나 자연어 입력은 없습니다.
- 단위 변환을 지원하지 않습니다.
- 재료 이름은 정규화된 정확한 이름 중심으로 매칭됩니다.
- 영양 목표, 예산, 선호도, 알레르기 정보는 반영하지 않습니다.
- Barcode scanning, image recognition, receipt scanning은 없습니다.

## Future Improvements

- Supabase persistence
- Authentication
- Recipe search
- Nutrition goals
- AI natural language ingredient input
- Barcode or receipt scanning
- Unit conversion
- Ingredient substitution
