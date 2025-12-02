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

        // Get all quiz attempts for the user
        const allAttempts = await prisma.quizAttempt.findMany({
            where: {
                userId: user.id,
                completed: true
            },
            include: {
                card: true
            },
            orderBy: {
                completedAt: 'desc'
            }
        });

        // Calculate statistics
        const totalCompleted = allAttempts.length;
        const truthsCompleted = allAttempts.filter(a => a.card.type === 'truth').length;
        const daresCompleted = allAttempts.filter(a => a.card.type === 'dare').length;

        // Calculate streak (consecutive days with at least one completion)
        let streak = 0;
        if (allAttempts.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let currentDate = new Date(today);
            let foundGap = false;

            while (!foundGap && streak < 365) { // Max 365 days to prevent infinite loop
                const dayStart = new Date(currentDate);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(currentDate);
                dayEnd.setHours(23, 59, 59, 999);

                const hasAttemptOnDay = allAttempts.some(attempt => {
                    const attemptDate = new Date(attempt.completedAt);
                    return attemptDate >= dayStart && attemptDate <= dayEnd;
                });

                if (hasAttemptOnDay) {
                    streak++;
                    currentDate.setDate(currentDate.getDate() - 1);
                } else {
                    foundGap = true;
                }
            }
        }

        // Get last played date
        const lastPlayed = allAttempts.length > 0
            ? allAttempts[0].completedAt
            : null;

        // Get category breakdown
        const categoryStats: Record<string, number> = {};
        allAttempts.forEach(attempt => {
            const category = attempt.card.category;
            categoryStats[category] = (categoryStats[category] || 0) + 1;
        });

        res.status(200).json({
            totalCompleted,
            truthsCompleted,
            daresCompleted,
            streak,
            lastPlayed,
            categoryStats,
            recentAttempts: allAttempts.slice(0, 10).map(a => ({
                id: a.id,
                cardType: a.card.type,
                category: a.card.category,
                completedAt: a.completedAt
            }))
        });

    } catch (error) {
        console.error('Error fetching quiz stats:', error);
        res.status(500).json({
            message: 'Error fetching quiz stats',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
