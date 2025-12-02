import React, { useState } from 'react';
import styles from '../styles/foodplan.module.css';

interface FoodItemData {
    id: number;
    name: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    notes?: string;
    isConsumed: boolean;
}

interface FoodItemProps {
    food: FoodItemData;
    onToggle: (foodId: number, isConsumed: boolean) => void;
}

const FoodItem: React.FC<FoodItemProps> = ({ food, onToggle }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleCheckboxChange = () => {
        onToggle(food.id, !food.isConsumed);
    };

    return (
        <div className={`${styles.foodItem} ${food.isConsumed ? styles.consumed : ''}`}>
            <div className={styles.foodMain}>
                <label className={styles.checkboxContainer}>
                    <input
                        type="checkbox"
                        checked={food.isConsumed}
                        onChange={handleCheckboxChange}
                        className={styles.checkbox}
                    />
                    <span className={styles.checkmark}></span>
                </label>

                <div className={styles.foodInfo} onClick={() => setIsExpanded(!isExpanded)}>
                    <div className={styles.foodName}>
                        {food.name}
                        <span className={styles.portion}>{food.portion}</span>
                    </div>

                    <div className={styles.macros}>
                        <span className={styles.macro}>
                            <span className={styles.macroValue}>{food.calories}</span> cal
                        </span>
                        <span className={styles.macroDivider}>|</span>
                        <span className={styles.macro}>
                            <span className={styles.macroValue}>{food.protein}g</span> P
                        </span>
                        <span className={styles.macro}>
                            <span className={styles.macroValue}>{food.carbs}g</span> C
                        </span>
                        <span className={styles.macro}>
                            <span className={styles.macroValue}>{food.fat}g</span> F
                        </span>
                    </div>
                </div>

                <button
                    className={styles.expandButton}
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                    {isExpanded ? '▲' : '▼'}
                </button>
            </div>

            {isExpanded && (
                <div className={styles.foodDetails}>
                    {food.notes && (
                        <div className={styles.notes}>
                            <strong>Notes:</strong> {food.notes}
                        </div>
                    )}

                    <div className={styles.detailedMacros}>
                        <div className={styles.macroDetail}>
                            <span className={styles.macroLabel}>Protein</span>
                            <span className={styles.macroDetailValue}>{food.protein}g</span>
                        </div>
                        <div className={styles.macroDetail}>
                            <span className={styles.macroLabel}>Carbs</span>
                            <span className={styles.macroDetailValue}>{food.carbs}g</span>
                        </div>
                        <div className={styles.macroDetail}>
                            <span className={styles.macroLabel}>Fat</span>
                            <span className={styles.macroDetailValue}>{food.fat}g</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodItem;
