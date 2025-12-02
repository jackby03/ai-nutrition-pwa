import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';

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

        const { cardId, completed } = req.body;

        // Validate input
        if (!cardId || typeof cardId !== 'number') {
            return res.status(400).json({ message: 'Invalid cardId' });
        }

        // Verify card exists
        const card = await prisma.quizCard.findUnique({
            where: { id: cardId }
        });

        if (!card) {
            return res.status(404).json({ message: 'Quiz card not found' });
        }

        // Create quiz attempt record
        const attempt = await prisma.quizAttempt.create({
            data: {
                userId: user.id,
                cardId: cardId,
                completed: completed !== false, // Default to true if not specified
                completedAt: new Date()
            }
        });

        res.status(200).json({
            success: true,
            attempt: {
                id: attempt.id,
                cardId: attempt.cardId,
                completed: attempt.completed,
                completedAt: attempt.completedAt
            }
        });

    } catch (error) {
        console.error('Error completing quiz card:', error);
        res.status(500).json({
            message: 'Error completing quiz card',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
