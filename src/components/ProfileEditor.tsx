import React, { useState } from 'react';
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

interface ProfileEditorProps {
    initialData: UserProfile;
    onSave: (data: UserProfile) => Promise<void>;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ initialData, onSave }) => {
    const [formData, setFormData] = useState<UserProfile>(initialData);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'age' || name === 'height' || name === 'weight' || name.startsWith('target')
                ? parseFloat(value) || 0
                : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            await onSave(formData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="border-b pb-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Edit Profile</h2>
                <p className="text-gray-600 text-sm">Update your personal details and nutritional goals.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Personal Information</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Age</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sex</label>
                            <select
                                name="sex"
                                value={formData.sex}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                            <input
                                type="number"
                                name="height"
                                value={formData.height}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                    </div>
                </div>

                {/* Goals & Activity */}
                <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Goals & Activity</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Activity Level</label>
                        <select
                            name="activityLevel"
                            value={formData.activityLevel}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        >
                            <option value="sedentary">Sedentary (Little or no exercise)</option>
                            <option value="light">Light (Exercise 1-3 times/week)</option>
                            <option value="moderate">Moderate (Exercise 4-5 times/week)</option>
                            <option value="active">Active (Daily exercise)</option>
                            <option value="very_active">Very Active (Intense exercise)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Goal</label>
                        <select
                            name="goal"
                            value={formData.goal}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        >
                            <option value="lose_weight">Lose Weight</option>
                            <option value="maintain_weight">Maintain Weight</option>
                            <option value="gain_weight">Gain Weight</option>
                            <option value="gain_muscle">Gain Muscle</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Diet Type</label>
                        <select
                            name="dietType"
                            value={formData.dietType}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        >
                            <option value="omnivore">Omnivore (Eat everything)</option>
                            <option value="vegetarian">Vegetarian</option>
                            <option value="vegan">Vegan</option>
                            <option value="keto">Keto</option>
                            <option value="paleo">Paleo</option>
                            <option value="pescatarian">Pescatarian</option>
                        </select>
                    </div>
                </div>

                {/* Dietary Restrictions */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="font-medium text-gray-900">Dietary Restrictions</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Allergies (comma separated)</label>
                        <input
                            type="text"
                            name="allergies"
                            value={formData.allergies}
                            onChange={handleChange}
                            placeholder="e.g. peanuts, shellfish"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Dislikes (comma separated)</label>
                        <input
                            type="text"
                            name="dislikes"
                            value={formData.dislikes}
                            onChange={handleChange}
                            placeholder="e.g. mushrooms, cilantro"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>
                </div>

                {/* Nutritional Targets (Advanced) */}
                <div className="md:col-span-2 space-y-4 border-t pt-4">
                    <h3 className="font-medium text-gray-900">Nutritional Targets (Auto-calculated, but editable)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Calories</label>
                            <input
                                type="number"
                                name="targetCalories"
                                value={formData.targetCalories}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Protein (g)</label>
                            <input
                                type="number"
                                name="targetProtein"
                                value={formData.targetProtein}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Carbs (g)</label>
                            <input
                                type="number"
                                name="targetCarbs"
                                value={formData.targetCarbs}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fat (g)</label>
                            <input
                                type="number"
                                name="targetFat"
                                value={formData.targetFat}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

export default ProfileEditor;
