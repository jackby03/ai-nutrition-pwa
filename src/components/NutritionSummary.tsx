import React from 'react';
import styles from '../styles/foodplan.module.css';

interface Summary {
    totalCalories: number;
    consumedCalories: number;
    remainingCalories: number;
    totalProtein: number;
    consumedProtein: number;
    totalCarbs: number;
    consumedCarbs: number;
    totalFat: number;
    consumedFat: number;
    totalItems: number;
    consumedItems: number;
    completionPercentage?: number;
}

interface NutritionSummaryProps {
    summary: Summary;
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
}

const NutritionSummary: React.FC<NutritionSummaryProps> = ({
    summary,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat
}) => {
    const caloriePercentage = Math.min((summary.consumedCalories / targetCalories) * 100, 100);
    const proteinPercentage = Math.min((summary.consumedProtein / targetProtein) * 100, 100);
    const carbsPercentage = Math.min((summary.consumedCarbs / targetCarbs) * 100, 100);
    const fatPercentage = Math.min((summary.consumedFat / targetFat) * 100, 100);

    return (
        <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Today's Progress</h2>

            {/* Calories */}
            <div className={styles.summarySection}>
                <div className={styles.summaryHeader}>
                    <span className={styles.summaryLabel}>Calories</span>
                    <span className={styles.summaryValue}>
                        {summary.consumedCalories} / {targetCalories}
                    </span>
                </div>
                <div className={styles.progressBarLarge}>
                    <div
                        className={styles.progressFillCalories}
                        style={{ width: `${caloriePercentage}%` }}
                    ></div>
                </div>
                <div className={styles.summarySubtext}>
                    {summary.remainingCalories > 0
                        ? `${summary.remainingCalories} cal remaining`
                        : 'Target reached! 🎉'
                    }
                </div>
            </div>

            {/* Macros */}
            <div className={styles.macrosGrid}>
                <div className={styles.macroCard}>
                    <div className={styles.macroIcon} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        P
                    </div>
                    <div className={styles.macroInfo}>
                        <div className={styles.macroLabel}>Protein</div>
                        <div className={styles.macroValue}>
                            {Math.round(summary.consumedProtein)}g / {targetProtein}g
                        </div>
                        <div className={styles.macroProgress}>
                            <div
                                className={styles.macroProgressFill}
                                style={{
                                    width: `${proteinPercentage}%`,
                                    background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className={styles.macroCard}>
                    <div className={styles.macroIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        C
                    </div>
                    <div className={styles.macroInfo}>
                        <div className={styles.macroLabel}>Carbs</div>
                        <div className={styles.macroValue}>
                            {Math.round(summary.consumedCarbs)}g / {targetCarbs}g
                        </div>
                        <div className={styles.macroProgress}>
                            <div
                                className={styles.macroProgressFill}
                                style={{
                                    width: `${carbsPercentage}%`,
                                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className={styles.macroCard}>
                    <div className={styles.macroIcon} style={{ background: 'linear-gradient(135deg, #ffa751 0%, #ffe259 100%)' }}>
                        F
                    </div>
                    <div className={styles.macroInfo}>
                        <div className={styles.macroLabel}>Fat</div>
                        <div className={styles.macroValue}>
                            {Math.round(summary.consumedFat)}g / {targetFat}g
                        </div>
                        <div className={styles.macroProgress}>
                            <div
                                className={styles.macroProgressFill}
                                style={{
                                    width: `${fatPercentage}%`,
                                    background: 'linear-gradient(90deg, #ffa751 0%, #ffe259 100%)'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Meal Completion */}
            <div className={styles.completionSection}>
                <div className={styles.completionHeader}>
                    <span>Meals Completed</span>
                    <span className={styles.completionValue}>
                        {summary.consumedItems} / {summary.totalItems}
                    </span>
                </div>
                <div className={styles.completionCircle}>
                    <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="10"
                        />
                        <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="10"
                            strokeDasharray={`${(summary.completionPercentage || 0) * 3.14} 314`}
                            strokeLinecap="round"
                            transform="rotate(-90 60 60)"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                        </defs>
                        <text
                            x="60"
                            y="60"
                            textAnchor="middle"
                            dy=".3em"
                            fontSize="24"
                            fontWeight="bold"
                            fill="#1f2937"
                        >
                            {summary.completionPercentage || 0}%
                        </text>
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default NutritionSummary;
