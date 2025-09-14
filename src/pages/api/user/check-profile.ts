import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await unstable_getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Try to find the user in our database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || !user.preferences) {
      return res.status(200).json({ 
        profileCompleted: false,
        user: null 
      });
    }

    // Parse the preferences to check if profile is complete
    try {
      const profileData = JSON.parse(user.preferences);
      const profileCompleted = !!(
        profileData.age && 
        profileData.sex &&
        profileData.height &&
        profileData.weight &&
        profileData.activityLevel &&
        profileData.goal &&
        profileData.dietType
      );

      res.status(200).json({ 
        profileCompleted,
        user: {
          name: user.name,
          email: user.email,
          profileData: profileCompleted ? profileData : null
        }
      });
    } catch (parseError) {
      // If preferences can't be parsed, profile is not complete
      res.status(200).json({ 
        profileCompleted: false,
        user: {
          name: user.name,
          email: user.email,
          profileData: null
        }
      });
    }
  } catch (error) {
    console.error('Error checking user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}