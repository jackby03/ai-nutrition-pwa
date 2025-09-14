import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface UserProfileData {
  age: number | '';
  sex: string;
  height: number | '';
  weight: number | '';
  activityLevel: string;
  goal: string;
  dietType: string;
  allergies: string[];
  dislikes: string[];
}

interface UserProfileSetupProps {
  userEmail: string;
}

const UserProfileSetup: React.FC<UserProfileSetupProps> = ({ userEmail }) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData>({
    age: '',
    sex: '',
    height: '',
    weight: '',
    activityLevel: '',
    goal: '',
    dietType: '',
    allergies: [],
    dislikes: []
  });

  const updateField = (field: keyof UserProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const calculateCalories = () => {
    if (!profileData.age || !profileData.height || !profileData.weight || !profileData.sex) {
      return 2000; // Default
    }

    // Mifflin-St Jeor Equation
    let bmr: number;
    if (profileData.sex === 'male') {
      bmr = 10 * Number(profileData.weight) + 6.25 * Number(profileData.height) - 5 * Number(profileData.age) + 5;
    } else {
      bmr = 10 * Number(profileData.weight) + 6.25 * Number(profileData.height) - 5 * Number(profileData.age) - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const tdee = bmr * (activityMultipliers[profileData.activityLevel as keyof typeof activityMultipliers] || 1.2);

    // Goal adjustments
    if (profileData.goal === 'lose_weight') return Math.round(tdee - 500);
    if (profileData.goal === 'gain_weight') return Math.round(tdee + 500);
    return Math.round(tdee);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const targetCalories = calculateCalories();
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileData,
          targetCalories,
          targetProtein: Math.round(targetCalories * 0.25 / 4), // 25% of calories from protein
          targetCarbs: Math.round(targetCalories * 0.45 / 4),   // 45% from carbs
          targetFat: Math.round(targetCalories * 0.30 / 9),     // 30% from fat
          allergies: JSON.stringify(profileData.allergies),
          dislikes: JSON.stringify(profileData.dislikes),
          profileCompleted: true
        })
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        alert('Error saving profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    }
    setLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={profileData.age}
                  onChange={(e) => updateField('age', e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base sm:text-sm"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
                <select
                  value={profileData.sex}
                  onChange={(e) => updateField('sex', e.target.value)}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base sm:text-sm"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={profileData.height}
                  onChange={(e) => updateField('height', e.target.value ? parseFloat(e.target.value) : '')}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base sm:text-sm"
                  placeholder="170"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={profileData.weight}
                  onChange={(e) => updateField('weight', e.target.value ? parseFloat(e.target.value) : '')}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base sm:text-sm"
                  placeholder="70"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Activity & Goals</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Activity Level</label>
              <div className="space-y-3">
                {[
                  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
                  { value: 'light', label: 'Light', desc: 'Light exercise 1-3 days/week' },
                  { value: 'moderate', label: 'Moderate', desc: 'Moderate exercise 3-5 days/week' },
                  { value: 'active', label: 'Active', desc: 'Hard exercise 6-7 days/week' },
                  { value: 'very_active', label: 'Very Active', desc: 'Very hard exercise, physical job' }
                ].map((option) => (
                  <label key={option.value} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      value={option.value}
                      checked={profileData.activityLevel === option.value}
                      onChange={(e) => updateField('activityLevel', e.target.value)}
                      className="mr-3 mt-1 text-green-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{option.label}</span>
                      <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Goal</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { value: 'lose_weight', label: 'Lose Weight', icon: '📉' },
                  { value: 'maintain_weight', label: 'Maintain Weight', icon: '⚖️' },
                  { value: 'gain_weight', label: 'Gain Weight', icon: '📈' },
                  { value: 'gain_muscle', label: 'Gain Muscle', icon: '💪' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      value={option.value}
                      checked={profileData.goal === option.value}
                      onChange={(e) => updateField('goal', e.target.value)}
                      className="mr-3 text-green-500"
                    />
                    <span className="mr-2 text-lg">{option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Dietary Preferences</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
              <select
                value={profileData.dietType}
                onChange={(e) => updateField('dietType', e.target.value)}
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base sm:text-sm"
              >
                <option value="">Select...</option>
                <option value="omnivore">🍽️ Omnivore</option>
                <option value="vegetarian">🥗 Vegetarian</option>
                <option value="vegan">🌱 Vegan</option>
                <option value="keto">🥓 Keto</option>
                <option value="paleo">🦴 Paleo</option>
                <option value="mediterranean">🫒 Mediterranean</option>
                <option value="low_carb">🥬 Low Carb</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Allergies (optional)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Nuts', 'Dairy', 'Eggs', 'Shellfish', 'Soy', 'Gluten', 'Fish', 'Sesame'].map((allergy) => (
                  <label key={allergy} className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileData.allergies.includes(allergy)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateField('allergies', [...profileData.allergies, allergy]);
                        } else {
                          updateField('allergies', profileData.allergies.filter(a => a !== allergy));
                        }
                      }}
                      className="mr-2 text-green-500"
                    />
                    <span className="text-xs sm:text-sm">{allergy}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Food Dislikes (optional)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Spicy Food', 'Sweet Food', 'Bitter Food', 'Seafood', 'Red Meat', 'Poultry'].map((dislike) => (
                  <label key={dislike} className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileData.dislikes.includes(dislike)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateField('dislikes', [...profileData.dislikes, dislike]);
                        } else {
                          updateField('dislikes', profileData.dislikes.filter(d => d !== dislike));
                        }
                      }}
                      className="mr-2 text-green-500"
                    />
                    <span className="text-xs sm:text-sm">{dislike}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        const estimatedCalories = calculateCalories();
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Summary</h2>
            
            <div className="bg-green-50 p-4 sm:p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Your Personalized Plan</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p><strong>Daily Calories:</strong> {estimatedCalories}</p>
                  <p><strong>Goal:</strong> {profileData.goal.replace('_', ' ')}</p>
                  <p><strong>Diet Type:</strong> {profileData.dietType}</p>
                </div>
                <div className="space-y-2">
                  <p><strong>Activity Level:</strong> {profileData.activityLevel.replace('_', ' ')}</p>
                  {profileData.allergies.length > 0 && (
                    <p><strong>Allergies:</strong> {profileData.allergies.join(', ')}</p>
                  )}
                  {profileData.dislikes.length > 0 && (
                    <p><strong>Dislikes:</strong> {profileData.dislikes.join(', ')}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">What's Next?</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✅ Get personalized meal recommendations</li>
                <li>✅ Track your daily nutrition</li>
                <li>✅ Achieve your health goals</li>
              </ul>
            </div>

            <p className="text-gray-600 text-xs sm:text-sm">
              Based on this information, we'll provide personalized meal recommendations and nutrition tracking.
              You can always update your preferences later in your profile settings.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
          {/* Progress Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Step {step} of 4</span>
              <span className="text-xs sm:text-sm font-medium text-gray-600">{Math.round((step / 4) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
              <div 
                className="bg-green-500 h-2 sm:h-3 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Complete Your Profile</h1>
            <p className="text-sm sm:text-base text-gray-600">Help us personalize your nutrition recommendations</p>
          </div>

          {/* Form Content */}
          <div className="min-h-[400px] sm:min-h-[450px]">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="w-full sm:w-auto px-6 py-3 sm:py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Previous
            </button>

            {step < 4 ? (
              <button
                onClick={nextStep}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm sm:text-base"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSetup;