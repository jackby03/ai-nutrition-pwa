import React from 'react';
import styles from '../styles/dashboard.module.css';
import MealRecommendation from './MealRecommendation';

interface User {
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

interface DashboardProps {
    userData: User;
}

const Dashboard: React.FC<DashboardProps> = ({ userData }) => {
    return (
        <div className={styles.dashboard}>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Welcome back, {userData.name || userData.email || 'User'}!
                </h1>
                <p className="text-gray-600">
                    Here's your personalized nutrition dashboard
                </p>
            </div>
            <MealRecommendation />
            {/* Additional user data and saved foods can be displayed here */}
        </div>
    );
};

export default Dashboard;