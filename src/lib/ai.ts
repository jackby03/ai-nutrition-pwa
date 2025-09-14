// AI service for meal recommendations

export async function getMealRecommendations(preferences = 'healthy', goals = 'weight loss'): Promise<string[]> {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ preferences, goals }),
    })

    if (!response.ok) {
      throw new Error('Failed to get meal recommendations')
    }

    const data = await response.json()
    
    // Split the meal plan into individual recommendations
    const meals = data.mealPlan?.split('\n').filter((meal: string) => meal.trim()) || []
    
    return meals
  } catch (error) {
    console.error('Error fetching meal recommendations:', error)
    throw error
  }
}