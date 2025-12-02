import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY || '' });

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

        const { planId, message } = req.body;

        if (!planId || !message) {
            return res.status(400).json({ message: 'Missing planId or message' });
        }

        // Fetch plan and verify ownership
        const plan = await prisma.plan.findUnique({
            where: { id: planId },
            include: {
                foodItems: true,
                user: true
            }
        });

        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        if (plan.user.email !== session.user.email) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // Save user message
        await prisma.chatMessage.create({
            data: {
                planId,
                role: 'user',
                content: message
            }
        });

        // Construct context
        const foodContext = plan.foodItems.map(item =>
            `ID: ${item.id}, Type: ${item.mealType}, Name: ${item.name}, Portion: ${item.portion}, Cals: ${item.calories}`
        ).join('\n');

        const systemPrompt = `You are a nutrition assistant helping a user modify their meal plan.
Current Plan Context:
${foodContext}

User Goal: ${plan.user.goal || 'healthy eating'}
Diet Type: ${plan.user.dietType || 'balanced'}

When the user asks to change something, use the available tools to modify the plan.
Always reply with a confirmation of what you did or a clarifying question.
If you add or update foods, estimate the nutritional values (protein, carbs, fat) if not provided.
`;

        // Define tools (New SDK format)
        const tools: any = [
            {
                functionDeclarations: [
                    {
                        name: "update_food_item",
                        description: "Update an existing food item in the meal plan",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                foodId: { type: "NUMBER", description: "The ID of the food item to update" },
                                name: { type: "STRING", description: "New name of the food" },
                                portion: { type: "STRING", description: "New portion size" },
                                calories: { type: "NUMBER", description: "Calories count" },
                                protein: { type: "NUMBER", description: "Protein in grams" },
                                carbs: { type: "NUMBER", description: "Carbs in grams" },
                                fat: { type: "NUMBER", description: "Fat in grams" }
                            },
                            required: ["foodId"]
                        }
                    },
                    {
                        name: "add_food_item",
                        description: "Add a new food item to the meal plan",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                mealType: { type: "STRING", description: "breakfast, lunch, dinner, or snack" },
                                name: { type: "STRING", description: "Name of the food" },
                                portion: { type: "STRING", description: "Portion size" },
                                calories: { type: "NUMBER", description: "Calories count" },
                                protein: { type: "NUMBER", description: "Protein in grams" },
                                carbs: { type: "NUMBER", description: "Carbs in grams" },
                                fat: { type: "NUMBER", description: "Fat in grams" }
                            },
                            required: ["mealType", "name", "calories", "protein", "carbs", "fat"]
                        }
                    },
                    {
                        name: "remove_food_item",
                        description: "Remove a food item from the meal plan",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                foodId: { type: "NUMBER", description: "The ID of the food item to remove" }
                            },
                            required: ["foodId"]
                        }
                    }
                ]
            }
        ];

        // Call Gemini (New SDK format)
        // We'll use a single turn for now, or construct history if needed.
        // For this MVP, we pass system prompt + user message.
        const response = await genai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [
                { role: 'user', parts: [{ text: systemPrompt + "\n\nUser: " + message }] }
            ],
            config: {
                tools: tools
            }
        });

        const candidate = response?.candidates?.[0];
        const parts = candidate?.content?.parts || [];

        let assistantResponseText = "";
        const executedActions: any[] = [];

        // Check for function calls
        for (const part of parts) {
            if (part.functionCall) {
                const call = part.functionCall;
                const args = call.args;

                if (call.name === 'update_food_item') {
                    const { foodId, ...updates } = args;
                    await prisma.foodItem.update({
                        where: { id: Number(foodId) },
                        data: updates
                    });
                    executedActions.push({ type: 'update', foodId, details: updates });
                } else if (call.name === 'add_food_item') {
                    const { mealType, name, portion, calories, protein, carbs, fat } = args;
                    // Find max order for this meal type
                    const maxOrder = await prisma.foodItem.findFirst({
                        where: { planId, mealType },
                        orderBy: { order: 'desc' }
                    });
                    const newOrder = (maxOrder?.order ?? -1) + 1;

                    await prisma.foodItem.create({
                        data: {
                            planId,
                            mealType,
                            name,
                            portion: portion || '1 serving',
                            calories: Number(calories),
                            protein: Number(protein),
                            carbs: Number(carbs),
                            fat: Number(fat),
                            order: newOrder
                        }
                    });
                    executedActions.push({ type: 'add', details: args });
                } else if (call.name === 'remove_food_item') {
                    const { foodId } = args;
                    await prisma.foodItem.delete({
                        where: { id: Number(foodId) }
                    });
                    executedActions.push({ type: 'remove', foodId });
                }
            }

            if (part.text) {
                assistantResponseText += part.text;
            }
        }

        // If functions were executed but no text response, generate a confirmation
        if (executedActions.length > 0 && !assistantResponseText) {
            // In a full implementation, we'd send the function output back to the model.
            // For this MVP, we'll generate a simple confirmation.
            if (executedActions.some(a => a.type === 'add')) assistantResponseText = "I've added that to your plan.";
            else if (executedActions.some(a => a.type === 'remove')) assistantResponseText = "I've removed that from your plan.";
            else assistantResponseText = "I've updated your plan.";
        }

        // Save assistant message
        await prisma.chatMessage.create({
            data: {
                planId,
                role: 'assistant',
                content: assistantResponseText || "I've processed your request.",
                action: executedActions.length > 0 ? JSON.stringify(executedActions) : null
            }
        });

        // Fetch updated plan
        const updatedPlan = await prisma.plan.findUnique({
            where: { id: planId },
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
        const allFoods = updatedPlan?.foodItems || [];
        const consumedFoods = allFoods.filter(f => f.isConsumed);
        const consumedCalories = consumedFoods.reduce((sum, f) => sum + f.calories, 0);
        const consumedProtein = consumedFoods.reduce((sum, f) => sum + f.protein, 0);
        const consumedCarbs = consumedFoods.reduce((sum, f) => sum + f.carbs, 0);
        const consumedFat = consumedFoods.reduce((sum, f) => sum + f.fat, 0);

        const summary = {
            totalCalories: plan.targetCalories,
            consumedCalories,
            remainingCalories: plan.targetCalories - consumedCalories,
            totalProtein: plan.targetProtein,
            consumedProtein,
            remainingProtein: plan.targetProtein - consumedProtein,
            totalCarbs: plan.targetCarbs,
            consumedCarbs,
            remainingCarbs: plan.targetCarbs - consumedCarbs,
            totalFat: plan.targetFat,
            consumedFat,
            remainingFat: plan.targetFat - consumedFat,
            totalItems: allFoods.length,
            consumedItems: consumedFoods.length,
            completionPercentage: allFoods.length > 0 ? Math.round((consumedFoods.length / allFoods.length) * 100) : 0
        };

        // Group foods
        const groupedFoods = {
            breakfast: allFoods.filter(item => item.mealType === 'breakfast'),
            lunch: allFoods.filter(item => item.mealType === 'lunch'),
            dinner: allFoods.filter(item => item.mealType === 'dinner'),
            snack: allFoods.filter(item => item.mealType === 'snack')
        };

        res.status(200).json({
            message: assistantResponseText || "Done!",
            plan: updatedPlan,
            summary,
            groupedFoods
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            message: 'Error processing message',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
