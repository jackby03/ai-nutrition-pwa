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
                    {/* Main Meal Plan - Takes full width on mobile, 2 cols on desktop */}
                    <div className="lg:col-span-2">
                        <MealRecommendation />
                    </div>
                    
                    {/* Sidebar - Stack below on mobile */}
                    <div className="space-y-4 sm:space-y-6">
                        {/* Today's Summary */}
                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Today's Summary</h3>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Calories</span>
                                    <span className="font-medium">0 / 2000</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
                                    <div>
                                        <div className="font-medium text-orange-600">Protein</div>
                                        <div className="text-gray-600">0g</div>
                                    </div>
                                    <div>
                                        <div className="font-medium text-blue-600">Carbs</div>
                                        <div className="text-gray-600">0g</div>
                                    </div>
                                    <div>
                                        <div className="font-medium text-yellow-600">Fat</div>
                                        <div className="text-gray-600">0g</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
                            <div className="space-y-2 sm:space-y-3">
                                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 sm:py-3 px-4 rounded-md transition-colors text-sm sm:text-base">
                                    📝 Log Food
                                </button>
                                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-md transition-colors text-sm sm:text-base">
                                    🔄 New Meal Plan
                                </button>
                                <button className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 sm:py-3 px-4 rounded-md transition-colors text-sm sm:text-base">
                                    ⚙️ Settings
                                </button>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
                            <div className="space-y-3">
                                <div className="text-sm text-gray-600 text-center py-4">
                                    No recent activity yet.<br />
                                    Start logging your meals! 🍽️
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;