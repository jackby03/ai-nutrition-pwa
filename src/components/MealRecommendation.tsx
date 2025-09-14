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
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Your Personalized Meal Plan</h2>
                <div className="flex flex-col sm:flex-row items-center justify-center py-8 sm:py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-3 sm:mb-0 sm:mr-3"></div>
                    <span className="text-sm sm:text-base text-gray-600 text-center">
                        Generating your personalized meal plan...
                    </span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Your Personalized Meal Plan</h2>
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex flex-col sm:flex-row">
                        <div className="flex-shrink-0 mb-3 sm:mb-0 text-center sm:text-left">
                            <svg className="h-5 w-5 text-red-400 mx-auto sm:mx-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="sm:ml-3 text-center sm:text-left">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                            <button
                                onClick={regenerateMealPlan}
                                className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded text-sm transition-colors w-full sm:w-auto"
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
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-0">Your Personalized Meal Plan</h2>
                <button
                    onClick={regenerateMealPlan}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 sm:py-2 rounded-md text-sm sm:text-base transition-colors w-full sm:w-auto"
                >
                    🔄 Generate New Plan
                </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 overflow-hidden">
                <div className="max-h-96 sm:max-h-none overflow-y-auto sm:overflow-visible">
                    <pre className="whitespace-pre-wrap text-xs sm:text-sm text-gray-700 font-mono leading-relaxed">
                        {mealPlan}
                    </pre>
                </div>
            </div>
            
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-gray-500 mb-2 sm:mb-0">
                    💡 This meal plan is generated based on your personal profile including your goals, dietary preferences, and restrictions.
                </div>
                <div className="flex gap-2">
                    <button className="text-xs text-green-600 hover:text-green-700 transition-colors">
                        📋 Copy Plan
                    </button>
                    <button className="text-xs text-blue-600 hover:text-blue-700 transition-colors">
                        📤 Share
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MealRecommendation;