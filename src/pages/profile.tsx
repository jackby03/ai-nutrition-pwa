import React, { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import { prisma } from '../lib/prisma';
import Navbar from '../components/Navbar';
import ProfileEditor from '../components/ProfileEditor';
import styles from '../styles/dashboard.module.css';

interface UserProfile {
    name: string;
    age: number;
    sex: string;
    height: number;
    weight: number;
    activityLevel: string;
    goal: string;
    dietType: string;
    allergies: string;
    dislikes: string;
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
}

interface ProfilePageProps {
    userProfile: UserProfile;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userProfile }) => {
    const [profile, setProfile] = useState<UserProfile>(userProfile);

    const handleSave = async (data: UserProfile) => {
        const response = await fetch('/api/user/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...data,
                allergies: data.allergies.split(',').map(s => s.trim()).filter(Boolean),
                dislikes: data.dislikes.split(',').map(s => s.trim()).filter(Boolean)
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update profile');
        }

        const result = await response.json();
        // Update local state if needed, though ProfileEditor handles its own state
        setProfile(data);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
                    <p className="mt-1 text-gray-600">Manage your personal information and nutrition settings.</p>
                </div>

                <ProfileEditor initialData={profile} onSave={handleSave} />
            </div>
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);

    if (!session?.user?.email) {
        return {
            redirect: {
                destination: '/auth/login',
                permanent: false,
            },
        };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        return {
            redirect: {
                destination: '/auth/login',
                permanent: false,
            },
        };
    }

    // Parse JSON fields safely
    let allergies = '';
    try {
        const parsed = JSON.parse(user.allergies || '[]');
        allergies = Array.isArray(parsed) ? parsed.join(', ') : user.allergies || '';
    } catch {
        allergies = user.allergies || '';
    }

    let dislikes = '';
    try {
        const parsed = JSON.parse(user.dislikes || '[]');
        dislikes = Array.isArray(parsed) ? parsed.join(', ') : user.dislikes || '';
    } catch {
        dislikes = user.dislikes || '';
    }

    const userProfile: UserProfile = {
        name: user.name || '',
        age: user.age || 0,
        sex: user.sex || 'other',
        height: user.height || 0,
        weight: user.weight || 0,
        activityLevel: user.activityLevel || 'moderate',
        goal: user.goal || 'maintain_weight',
        dietType: user.dietType || 'omnivore',
        allergies,
        dislikes,
        targetCalories: user.targetCalories || 2000,
        targetProtein: user.targetProtein || 150,
        targetCarbs: user.targetCarbs || 250,
        targetFat: user.targetFat || 70,
    };

    return {
        props: {
            userProfile,
        },
    };
};

export default ProfilePage;
