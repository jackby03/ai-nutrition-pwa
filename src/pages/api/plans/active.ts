import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
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

        // Get active plan with food items
        const plan = await prisma.plan.findFirst({
            where: {
                userId: user.id,
                isActive: true
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

        if (!plan) {
            return res.status(404).json({
                message: 'No active plan found',
                hasNoPlan: true
            });
        }

        // Calculate summary
        const consumedItems = plan.foodItems.filter(item => item.isConsumed);

        const consumedCalories = consumedItems.reduce((sum, item) => sum + item.calories, 0);
        const consumedProtein = consumedItems.reduce((sum, item) => sum + item.protein, 0);
        const consumedCarbs = consumedItems.reduce((sum, item) => sum + item.carbs, 0);
        const consumedFat = consumedItems.reduce((sum, item) => sum + item.fat, 0);

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
            totalItems: plan.foodItems.length,
            consumedItems: consumedItems.length,
            completionPercentage: Math.round((consumedItems.length / plan.foodItems.length) * 100)
        };

        // Group food items by meal type
        const groupedFoods = {
            breakfast: plan.foodItems.filter(item => item.mealType === 'breakfast'),
            lunch: plan.foodItems.filter(item => item.mealType === 'lunch'),
            dinner: plan.foodItems.filter(item => item.mealType === 'dinner'),
            snack: plan.foodItems.filter(item => item.mealType === 'snack')
        };

        res.status(200).json({
            plan,
            summary,
            groupedFoods
        });

    } catch (error) {
        console.error('Error fetching active plan:', error);
        res.status(500).json({
            message: 'Error fetching active plan',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
