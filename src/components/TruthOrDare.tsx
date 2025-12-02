import React, { useState, useEffect } from 'react';
import QuizCard from './QuizCard';
import styles from '../styles/quiz.module.css';

interface Card {
    id: number;
    type: 'truth' | 'dare';
    question: string;
    difficulty: string;
    category: string;
}

const TruthOrDare: React.FC = () => {
    const [selectedType, setSelectedType] = useState<'truth' | 'dare' | null>(null);
    const [currentCard, setCurrentCard] = useState<Card | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [stats, setStats] = useState({
        totalCompleted: 0,
        truthsCompleted: 0,
        daresCompleted: 0,
        streak: 0
    });

    // Fetch stats on mount
    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/quiz/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchCard = async (type: 'truth' | 'dare') => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/quiz/card?type=${type}`);

            if (!response.ok) {
                throw new Error('Failed to fetch card');
            }

            const card = await response.json();
            setCurrentCard(card);
            setSelectedType(type);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load card');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        if (!currentCard) return;

        try {
            const response = await fetch('/api/quiz/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cardId: currentCard.id,
                    completed: true
                })
            });

            if (response.ok) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 2000);

                // Update stats
                await fetchStats();

                // Reset to show type selection
                setCurrentCard(null);
                setSelectedType(null);
            }
        } catch (err) {
            console.error('Error completing card:', err);
        }
    };

    const handleSkip = () => {
        // Just get a new card of the same type
        if (selectedType) {
            fetchCard(selectedType);
        }
    };

    const handleReset = () => {
        setCurrentCard(null);
        setSelectedType(null);
        setError(null);
    };

    return (
        <div className={styles.container}>
            {showConfetti && (
                <div className={styles.confetti}>
                    <div className={styles.confettiPiece}>🎉</div>
                    <div className={styles.confettiPiece}>✨</div>
                    <div className={styles.confettiPiece}>🌟</div>
                    <div className={styles.confettiPiece}>💫</div>
                    <div className={styles.confettiPiece}>⭐</div>
                </div>
            )}

            <div className={styles.header}>
                <h1 className={styles.title}>Nutrition Quiz Challenge</h1>
                <p className={styles.subtitle}>Test your knowledge and build healthy habits!</p>
            </div>

            {/* Stats Display */}
            <div className={styles.statsBar}>
                <div className={styles.statItem}>
                    <div className={styles.statValue}>{stats.totalCompleted}</div>
                    <div className={styles.statLabel}>Completed</div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statValue}>{stats.streak}</div>
                    <div className={styles.statLabel}>Day Streak 🔥</div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statValue}>{stats.truthsCompleted}</div>
                    <div className={styles.statLabel}>Truths</div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statValue}>{stats.daresCompleted}</div>
                    <div className={styles.statLabel}>Dares</div>
                </div>
            </div>

            {/* Main Content */}
            {!currentCard && !loading && (
                <div className={styles.typeSelection}>
                    <h2 className={styles.selectionTitle}>Choose Your Challenge</h2>
                    <div className={styles.buttonGroup}>
                        <button
                            className={`${styles.typeButton} ${styles.truthButton}`}
                            onClick={() => fetchCard('truth')}
                        >
                            <span className={styles.buttonIcon}>🤔</span>
                            <span className={styles.buttonText}>TRUTH</span>
                            <span className={styles.buttonDesc}>Test your nutrition knowledge</span>
                        </button>
                        <button
                            className={`${styles.typeButton} ${styles.dareButton}`}
                            onClick={() => fetchCard('dare')}
                        >
                            <span className={styles.buttonIcon}>🎯</span>
                            <span className={styles.buttonText}>DARE</span>
                            <span className={styles.buttonDesc}>Take on a healthy challenge</span>
                        </button>
                    </div>
                </div>
            )}

            {loading && (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading your challenge...</p>
                </div>
            )}

            {error && (
                <div className={styles.error}>
                    <p>{error}</p>
                    <button onClick={handleReset} className={styles.retryButton}>
                        Try Again
                    </button>
                </div>
            )}

            {currentCard && !loading && (
                <div className={styles.cardWrapper}>
                    <QuizCard
                        type={currentCard.type}
                        question={currentCard.question}
                        difficulty={currentCard.difficulty}
                        category={currentCard.category}
                        onComplete={handleComplete}
                        onSkip={handleSkip}
                    />
                    <button onClick={handleReset} className={styles.backButton}>
                        ← Choose Different Type
                    </button>
                </div>
            )}
        </div>
    );
};

export default TruthOrDare;
