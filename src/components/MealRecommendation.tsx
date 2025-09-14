import React, { useEffect, useState } from 'react';

const MealRecommendation: React.FC = () => {
    const [mealPlan, setMealPlan] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMeals = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch('/api/ai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({})
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch meal recommendations');
                }

                const data = await response.json();
                setMealPlan(data.mealPlan);
            } catch (err) {
                console.error('Error fetching meal recommendations:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch meal recommendations');
            } finally {
                setLoading(false);
            }
        };

        fetchMeals();
    }, []);

    const regenerateMealPlan = () => {
        setMealPlan('');
        setLoading(true);
        setError(null);
        
        const fetchMeals = async () => {
            try {
                const response = await fetch('/api/ai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({})
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch meal recommendations');
                }

                const data = await response.json();
                setMealPlan(data.mealPlan);
            } catch (err) {
                console.error('Error fetching meal recommendations:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch meal recommendations');
            } finally {
                setLoading(false);
            }
        };

        fetchMeals();
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Personalized Meal Plan</h2>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    <span className="ml-3 text-gray-600">Generating your personalized meal plan...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Personalized Meal Plan</h2>
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                            <button
                                onClick={regenerateMealPlan}
                                className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Your Personalized Meal Plan</h2>
                <button
                    onClick={regenerateMealPlan}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
                >
                    Generate New Plan
                </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                    {mealPlan}
                </pre>
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
                💡 This meal plan is generated based on your personal profile including your goals, dietary preferences, and restrictions.
            </div>
        </div>
    );
};

export default MealRecommendation;