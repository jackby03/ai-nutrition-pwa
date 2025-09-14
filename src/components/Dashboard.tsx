import React from 'react';
import styles from '../styles/dashboard.module.css';
import MealRecommendation from './MealRecommendation';

const Dashboard: React.FC = () => {
    return (
        <div className={styles.dashboard}>
            <h1>Your Dashboard</h1>
            <MealRecommendation />
            {/* Additional user data and saved foods can be displayed here */}
        </div>
    );
};

export default Dashboard;