import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import { GoogleGenAI } from '@google/genai';

interface FoodItemInput {
    mealType: string;
    name: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    order: number;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const session = await unstable_getServerSession(req, res, authOptions);

        if (!session?.user?.email) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name } = req.body;

        // Deactivate previous active plans
        await prisma.plan.updateMany({
            where: {
                userId: user.id,
                isActive: true
            },
            data: {
                isActive: false
            }
        });

        // Build AI prompt for structured JSON output
        const prompt = `Create a daily meal plan for a ${user.age}-year-old ${user.sex}, ${user.weight}kg, ${user.height}cm tall, with ${user.activityLevel} lifestyle, aiming to ${user.goal} on a ${user.dietType} diet.

Target: ${user.targetCalories} calories, ${user.targetProtein}g protein, ${user.targetCarbs}g carbs, ${user.targetFat}g fat.
${user.allergies ? `Allergies: ${user.allergies}` : ''}
${user.dislikes ? `Dislikes: ${user.dislikes}` : ''}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):
{
  "meals": [
    {
      "mealType": "breakfast",
      "name": "Food name",
      "portion": "Amount (e.g., 1 cup, 150g)",
      "calories": 300,
      "protein": 20,
      "carbs": 40,
      "fat": 10
    }
  ]
}

Include 3-4 breakfast items, 3-4 lunch items, 3-4 dinner items, and 2-3 snacks. Make it realistic and delicious!`;

        // Call Gemini API
        const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY || '' });

        let foodItems: FoodItemInput[] = [];

        try {
            const response = await genai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: [{
                    parts: [{ text: prompt }]
                }]
            });

            const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';

            console.log('AI Response:', text.substring(0, 500));

            // Extract JSON from response (handle markdown code blocks)
            let jsonText = text.trim();
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
            } else if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
            }

            const parsed = JSON.parse(jsonText);

            if (parsed.meals && Array.isArray(parsed.meals)) {
                // Add order to each item
                const mealTypeOrder: { [key: string]: number } = {};

                foodItems = parsed.meals.map((meal: any) => {
                    const mealType = meal.mealType.toLowerCase();
                    if (!mealTypeOrder[mealType]) {
                        mealTypeOrder[mealType] = 0;
                    }

                    return {
                        mealType,
                        name: meal.name,
                        portion: meal.portion || '1 serving',
                        calories: parseInt(meal.calories) || 0,
                        protein: parseFloat(meal.protein) || 0,
                        carbs: parseFloat(meal.carbs) || 0,
                        fat: parseFloat(meal.fat) || 0,
                        order: mealTypeOrder[mealType]++,
                        isConsumed: false
                    };
                });
            }
        } catch (aiError) {
            console.error('AI generation error:', aiError);
            throw new Error('Failed to generate meal plan from AI');
        }

        if (foodItems.length === 0) {
            return res.status(500).json({
                message: 'Failed to generate meal plan. Please try again.',
                hint: 'The AI did not return valid meal data'
            });
        }

        console.log(`Generated ${foodItems.length} food items`);

        // Create plan with food items
        const plan = await prisma.plan.create({
            data: {
                userId: user.id,
                name: name || `Meal Plan - ${new Date().toLocaleDateString()}`,
                description: 'AI-generated personalized meal plan',
                targetCalories: user.targetCalories || 2000,
                targetProtein: user.targetProtein || 150,
                targetCarbs: user.targetCarbs || 250,
                targetFat: user.targetFat || 70,
                isActive: true,
                foodItems: {
                    create: foodItems
                }
            },
            include: {
                foodItems: {
                    orderBy: [
                        { mealType: 'asc' },
                        { order: 'asc' }
                    ]
                }
            }
        });

        // Calculate summary
        const summary = {
            totalCalories: plan.targetCalories,
            consumedCalories: 0,
            remainingCalories: plan.targetCalories,
            totalProtein: plan.targetProtein,
            consumedProtein: 0,
            remainingProtein: plan.targetProtein,
            totalCarbs: plan.targetCarbs,
            consumedCarbs: 0,
            remainingCarbs: plan.targetCarbs,
            totalFat: plan.targetFat,
            consumedFat: 0,
            remainingFat: plan.targetFat,
            totalItems: plan.foodItems.length,
            consumedItems: 0,
            completionPercentage: 0
        };

        res.status(200).json({
            plan,
            summary
        });

    } catch (error) {
        console.error('Error creating meal plan:', error);
        res.status(500).json({
            message: 'Error creating meal plan',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
