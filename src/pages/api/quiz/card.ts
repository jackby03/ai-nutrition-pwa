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

    const { type } = req.query;

    // Validate type parameter
    if (type && type !== 'truth' && type !== 'dare') {
      return res.status(400).json({ message: 'Invalid card type. Must be "truth" or "dare"' });
    }

    // Get recently completed card IDs (last 20) to avoid repetition
    const recentAttempts = await prisma.quizAttempt.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: 'desc' },
      take: 20,
      select: { cardId: true }
    });

    const recentCardIds = recentAttempts.map(attempt => attempt.cardId);

    // Query for available cards
    const whereClause: any = {
      isActive: true,
      ...(type && { type: type as string }),
      ...(recentCardIds.length > 0 && {
        id: { notIn: recentCardIds }
      })
    };

    // Get all matching cards
    const availableCards = await prisma.quizCard.findMany({
      where: whereClause
    });

    if (availableCards.length === 0) {
      // If no cards available (all recently seen), reset and get any card
      const fallbackCards = await prisma.quizCard.findMany({
        where: {
          isActive: true,
          ...(type && { type: type as string })
        }
      });

      if (fallbackCards.length === 0) {
        return res.status(404).json({ message: 'No quiz cards available' });
      }

      // Return random card from fallback
      const randomCard = fallbackCards[Math.floor(Math.random() * fallbackCards.length)];
      return res.status(200).json(randomCard);
    }

    // Return random card from available cards
    const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    res.status(200).json(randomCard);

  } catch (error) {
    console.error('Error fetching quiz card:', error);
    res.status(500).json({ 
      message: 'Error fetching quiz card',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
