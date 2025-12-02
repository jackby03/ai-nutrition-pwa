import React, { useEffect, useState } from 'react';
import FoodItemChecklist from './FoodItemChecklist';
import NutritionSummary from './NutritionSummary';
import PlanChatbot from './PlanChatbot';
import styles from '../styles/foodplan.module.css';

interface FoodItem {
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

interface Plan {
    id: number;
    name: string;
    description?: string;
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
    foodItems: FoodItem[];
}

interface Summary {
    totalCalories: number;
    consumedCalories: number;
    remainingCalories: number;
    totalProtein: number;
    consumedProtein: number;
    totalCarbs: number;
    consumedCarbs: number;
    totalFat: number;
    consumedFat: number;
    totalItems: number;
    consumedItems: number;
    completionPercentage?: number;
}

interface GroupedFoods {
    breakfast: FoodItem[];
    lunch: FoodItem[];
    dinner: FoodItem[];
    snack: FoodItem[];
}

const FoodPlanManager: React.FC = () => {
    const [plan, setPlan] = useState<Plan | null>(null);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [groupedFoods, setGroupedFoods] = useState<GroupedFoods | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchActivePlan();
    }, []);

    const fetchActivePlan = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/plans/active');
            const data = await response.json();

            if (response.status === 404 && data.hasNoPlan) {
                // No plan exists, show create button
                setPlan(null);
                setSummary(null);
                setGroupedFoods(null);
            } else if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch plan');
            } else {
                setPlan(data.plan);
                setSummary(data.summary);
                setGroupedFoods(data.groupedFoods);
            }
        } catch (err) {
            console.error('Error fetching plan:', err);
            setError(err instanceof Error ? err.message : 'Failed to load plan');
        } finally {
            setLoading(false);
        }
    };

    const createNewPlan = async () => {
        try {
            setCreating(true);
            setError(null);

            const response = await fetch('/api/plans/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: `Meal Plan - ${new Date().toLocaleDateString()}`
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to create plan');
            }

            const data = await response.json();
            setPlan(data.plan);
            setSummary(data.summary);

            // Group foods by meal type
            const grouped: GroupedFoods = {
                breakfast: data.plan.foodItems.filter((f: FoodItem) => f.mealType === 'breakfast'),
                lunch: data.plan.foodItems.filter((f: FoodItem) => f.mealType === 'lunch'),
                dinner: data.plan.foodItems.filter((f: FoodItem) => f.mealType === 'dinner'),
                snack: data.plan.foodItems.filter((f: FoodItem) => f.mealType === 'snack')
            };
            setGroupedFoods(grouped);

        } catch (err) {
            console.error('Error creating plan:', err);
            setError(err instanceof Error ? err.message : 'Failed to create plan');
        } finally {
            setCreating(false);
        }
    };

    const handleFoodToggle = async (foodId: number, isConsumed: boolean) => {
        try {
            const response = await fetch(`/api/foods/${foodId}/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isConsumed })
            });

            if (!response.ok) {
                throw new Error('Failed to update food item');
            }

            const data = await response.json();

            // Update local state
            if (plan) {
                const updatedFoodItems = plan.foodItems.map(item =>
                    item.id === foodId ? { ...item, isConsumed, consumedAt: data.foodItem.consumedAt } : item
                );

                setPlan({ ...plan, foodItems: updatedFoodItems });
                setSummary(data.summary);

                // Update grouped foods
                const grouped: GroupedFoods = {
                    breakfast: updatedFoodItems.filter(f => f.mealType === 'breakfast'),
                    lunch: updatedFoodItems.filter(f => f.mealType === 'lunch'),
                    dinner: updatedFoodItems.filter(f => f.mealType === 'dinner'),
                    snack: updatedFoodItems.filter(f => f.mealType === 'snack')
                };
                setGroupedFoods(grouped);
            }
        } catch (err) {
            console.error('Error toggling food:', err);
            setError(err instanceof Error ? err.message : 'Failed to update food');
        }
    };

    const handlePlanUpdate = (data: any) => {
        if (data.plan) setPlan(data.plan);
        if (data.summary) setSummary(data.summary);
        if (data.groupedFoods) setGroupedFoods(data.groupedFoods);
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading your meal plan...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h3>Error</h3>
                    <p>{error}</p>
                    <button onClick={fetchActivePlan} className={styles.retryButton}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🍽️</div>
                    <h2>No Active Meal Plan</h2>
                    <p>Create your first personalized meal plan to get started!</p>
                    <button
                        onClick={createNewPlan}
                        className={styles.createButton}
                        disabled={creating}
                    >
                        {creating ? 'Creating Plan...' : '✨ Create Meal Plan'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{plan.name}</h1>
                    <p className={styles.subtitle}>{plan.description}</p>
                </div>
                <button onClick={createNewPlan} className={styles.regenerateButton} disabled={creating}>
                    {creating ? 'Generating...' : '🔄 New Plan'}
                </button>
            </div>

            <div className={styles.grid}>
                <div className={styles.mainContent}>
                    {groupedFoods && (
                        <FoodItemChecklist
                            groupedFoods={groupedFoods}
                            onToggle={handleFoodToggle}
                        />
                    )}
                </div>

                <div className={styles.sidebar}>
                    {summary && (
                        <NutritionSummary
                            summary={summary}
                            targetCalories={plan.targetCalories}
                            targetProtein={plan.targetProtein}
                            targetCarbs={plan.targetCarbs}
                            targetFat={plan.targetFat}
                        />
                    )}
                </div>
            </div>

            <PlanChatbot
                planId={plan.id}
                onPlanUpdate={handlePlanUpdate}
            />
        </div>
    );
};

export default FoodPlanManager;
