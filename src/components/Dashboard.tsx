import React from 'react';
import Link from 'next/link';
import styles from '../styles/dashboard.module.css';
import FoodPlanManager from './FoodPlanManager';

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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Welcome Section */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                                Welcome back, {userData.name || userData.email?.split('@')[0] || 'User'}! 👋
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600">
                                Here's your personalized nutrition dashboard
                            </p>
                        </div>

                        {/* Quick Stats - Mobile Scrollable */}
                        <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0">
                            <div className="flex-shrink-0 bg-green-50 p-3 sm:p-4 rounded-lg text-center min-w-[80px]">
                                <div className="text-lg sm:text-xl font-bold text-green-600">🎯</div>
                                <div className="text-xs sm:text-sm text-gray-600">Goals</div>
                            </div>
                            <div className="flex-shrink-0 bg-blue-50 p-3 sm:p-4 rounded-lg text-center min-w-[80px]">
                                <div className="text-lg sm:text-xl font-bold text-blue-600">📊</div>
                                <div className="text-xs sm:text-sm text-gray-600">Progress</div>
                            </div>
                            <div className="flex-shrink-0 bg-purple-50 p-3 sm:p-4 rounded-lg text-center min-w-[80px]">
                                <div className="text-lg sm:text-xl font-bold text-purple-600">🍽️</div>
                                <div className="text-xs sm:text-sm text-gray-600">Meals</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Main Meal Plan - Takes full width */}
                    <div className="lg:col-span-3">
                        <FoodPlanManager />
                    </div>

                    {/* Sidebar moved inside FoodPlanManager */}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;