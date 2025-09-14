import { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { prisma } from '../../lib/prisma'

// Simple fetch-based approach to Google Gemini API
async function generateMealPlan(userProfile: any) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error('Google Gemini API key not configured')
  }

  // Create a detailed prompt based on user profile
  let prompt = `Generate a personalized daily meal plan for a person with the following profile:

PERSONAL INFO:
- Age: ${userProfile.age || 'not specified'}
- Sex: ${userProfile.sex || 'not specified'}
- Weight: ${userProfile.weight || 'not specified'} kg
- Height: ${userProfile.height || 'not specified'} cm
- Activity Level: ${userProfile.activityLevel || 'moderate'}

GOALS & DIET:
- Goal: ${userProfile.goal || 'maintain weight'}
- Diet Type: ${userProfile.dietType || 'omnivore'}
- Target Calories: ${userProfile.targetCalories || 2000}
- Target Protein: ${userProfile.targetProtein || 150}g
- Target Carbs: ${userProfile.targetCarbs || 250}g
- Target Fat: ${userProfile.targetFat || 70}g

RESTRICTIONS:
- Allergies: ${userProfile.allergies ? (Array.isArray(userProfile.allergies) ? userProfile.allergies.join(', ') : userProfile.allergies) : 'none'}
- Dislikes: ${userProfile.dislikes ? (Array.isArray(userProfile.dislikes) ? userProfile.dislikes.join(', ') : userProfile.dislikes) : 'none'}

Please create a detailed meal plan with:
1. Breakfast, lunch, dinner, and 2 snacks
2. Approximate calories and macros for each meal
3. Specific food items and portions
4. Total daily calories should be around ${userProfile.targetCalories || 2000}
5. Respect all dietary restrictions and preferences
6. Format as a clear, easy-to-read meal plan

Make it practical and realistic for everyday cooking.`

  // Try multiple model endpoints
  const modelUrls = [
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
  ];

  let lastError;
  
  for (const url of modelUrls) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No meal plan generated';
      } else {
        const errorText = await response.text();
        console.log(`Failed with ${url}:`, errorText);
        lastError = errorText;
      }
    } catch (error) {
      console.log(`Error with ${url}:`, error);
      lastError = error;
    }
  }

  // If all models failed, throw the last error
  throw new Error(`All Gemini API models failed. Last error: ${lastError}`);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await unstable_getServerSession(req, res, authOptions)
    
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Get user profile from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || !user.preferences) {
      return res.status(404).json({ message: 'User profile not found. Please complete your profile first.' })
    }

    // Parse profile data from preferences
    let userProfile;
    try {
      userProfile = JSON.parse(user.preferences);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid profile data. Please complete your profile again.' })
    }

    // Generate personalized meal plan
    const mealPlan = await generateMealPlan(userProfile)
    res.status(200).json({ mealPlan })
  } catch (error) {
    console.error('Error generating meal plan:', error)
    res.status(500).json({ 
      message: 'Error generating meal plan',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}