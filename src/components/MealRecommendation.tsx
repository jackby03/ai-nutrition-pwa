import React, { useEffect, useState } from 'react';
import { getMealRecommendations } from '../lib/ai';

const MealRecommendation: React.FC = () => {
    const [meals, setMeals] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMeals = async () => {
            try {
                const recommendations = await getMealRecommendations();
                setMeals(recommendations);
            } catch (err) {
                setError('Failed to fetch meal recommendations.');
            } finally {
                setLoading(false);
            }
        };

        fetchMeals();
    }, []);

    if (loading) {
        return <div>Loading meal recommendations...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2>AI-Generated Meal Recommendations</h2>
            <ul>
                {meals.map((meal, index) => (
                    <li key={index}>{meal}</li>
                ))}
            </ul>
        </div>
    );
};

export default MealRecommendation;