import React from 'react';
import FoodItem from './FoodItem';
import styles from '../styles/foodplan.module.css';

interface FoodItemData {
    id: number;
    mealType: string;
    name: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    notes?: string;
    isConsumed: boolean;
    consumedAt?: string;
    order: number;
}

interface GroupedFoods {
    breakfast: FoodItemData[];
    lunch: FoodItemData[];
    dinner: FoodItemData[];
    snack: FoodItemData[];
}

interface FoodItemChecklistProps {
    groupedFoods: GroupedFoods;
    onToggle: (foodId: number, isConsumed: boolean) => void;
}

const FoodItemChecklist: React.FC<FoodItemChecklistProps> = ({ groupedFoods, onToggle }) => {
    const mealTypes = [
        { key: 'breakfast', label: 'Breakfast', icon: '🌅' },
        { key: 'lunch', label: 'Lunch', icon: '☀️' },
        { key: 'dinner', label: 'Dinner', icon: '🌙' },
        { key: 'snack', label: 'Snacks', icon: '🍎' }
    ];

    const calculateMealProgress = (foods: FoodItemData[]) => {
        if (foods.length === 0) return 0;
        const consumed = foods.filter(f => f.isConsumed).length;
        return Math.round((consumed / foods.length) * 100);
    };

    return (
        <div className={styles.checklist}>
            {mealTypes.map(({ key, label, icon }) => {
                const foods = groupedFoods[key as keyof GroupedFoods];
                if (foods.length === 0) return null;

                const progress = calculateMealProgress(foods);
                const consumedCount = foods.filter(f => f.isConsumed).length;

                return (
                    <div key={key} className={styles.mealSection}>
                        <div className={styles.mealHeader}>
                            <div className={styles.mealTitle}>
                                <span className={styles.mealIcon}>{icon}</span>
                                <h3>{label}</h3>
                                <span className={styles.mealCount}>
                                    {consumedCount}/{foods.length}
                                </span>
                            </div>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className={styles.foodList}>
                            {foods.map(food => (
                                <FoodItem
                                    key={food.id}
                                    food={food}
                                    onToggle={onToggle}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default FoodItemChecklist;
