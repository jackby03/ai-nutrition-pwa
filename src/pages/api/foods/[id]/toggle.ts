import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '../../../../lib/prisma';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid food item ID' });
    }

    const foodId = parseInt(id);

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const session = await unstable_getServerSession(req, res, authOptions);

        if (!session?.user?.email) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { isConsumed } = req.body;

        // Get food item with plan to verify ownership
        const foodItem = await prisma.foodItem.findUnique({
            where: { id: foodId },
            include: {
                plan: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (!foodItem) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        // Verify user owns this plan
        if (foodItem.plan.user.email !== session.user.email) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // Update food item
        const updatedFood = await prisma.foodItem.update({
            where: { id: foodId },
            data: {
                isConsumed: isConsumed !== false,
                consumedAt: isConsumed !== false ? new Date() : null
            }
        });

        // Recalculate plan summary
        const allFoods = await prisma.foodItem.findMany({
            where: { planId: foodItem.planId }
        });

        const consumedFoods = allFoods.filter((f: any) => f.isConsumed);
        const consumedCalories = consumedFoods.reduce((sum: number, f: any) => sum + f.calories, 0);
        const consumedProtein = consumedFoods.reduce((sum: number, f: any) => sum + f.protein, 0);
        const consumedCarbs = consumedFoods.reduce((sum: number, f: any) => sum + f.carbs, 0);
        const consumedFat = consumedFoods.reduce((sum: number, f: any) => sum + f.fat, 0);

        const summary = {
            totalCalories: foodItem.plan.targetCalories,
            consumedCalories,
            remainingCalories: foodItem.plan.targetCalories - consumedCalories,
            totalProtein: foodItem.plan.targetProtein,
            consumedProtein,
            totalCarbs: foodItem.plan.targetCarbs,
            consumedCarbs,
            totalFat: foodItem.plan.targetFat,
            consumedFat,
            totalItems: allFoods.length,
            consumedItems: consumedFoods.length,
            completionPercentage: allFoods.length > 0 ? Math.round((consumedFoods.length / allFoods.length) * 100) : 0
        };

        res.status(200).json({
            foodItem: updatedFood,
            summary
        });

    } catch (error) {
        console.error('Error toggling food item:', error);
        res.status(500).json({
            message: 'Error toggling food item',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
