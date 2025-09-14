import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await unstable_getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized - Please log in' });
    }

    const {
      age,
      sex,
      height,
      weight,
      activityLevel,
      goal,
      dietType,
      allergies,
      dislikes,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      profileCompleted
    } = req.body;

    // For now, we'll store data in the preferences field as JSON until migration is run
    const profileData = {
      age: parseInt(age),
      sex,
      height: parseFloat(height),
      weight: parseFloat(weight),
      activityLevel,
      goal,
      dietType,
      allergies,
      dislikes,
      targetCalories: parseInt(targetCalories),
      targetProtein: parseFloat(targetProtein),
      targetCarbs: parseFloat(targetCarbs),
      targetFat: parseFloat(targetFat),
      profileCompleted: true
    };

    // Find or create user - store profile data in preferences field for now
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {
        name: session.user.name,
        preferences: JSON.stringify(profileData)
      },
      create: {
        email: session.user.email,
        name: session.user.name || '',
        password: '', // OAuth users don't need password
        preferences: JSON.stringify(profileData)
      }
    });

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}