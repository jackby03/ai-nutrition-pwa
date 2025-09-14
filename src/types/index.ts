export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
}

export interface MealPlan {
  id: string;
  userId: string;
  meals: Food[];
  createdAt: Date;
}