import React, { useState } from 'react';
import styles from '../styles/quiz.module.css';

interface QuizCardProps {
    type: 'truth' | 'dare';
    question: string;
    difficulty: string;
    category: string;
    onComplete: () => void;
    onSkip: () => void;
}

const QuizCard: React.FC<QuizCardProps> = ({
    type,
    question,
    difficulty,
    category,
    onComplete,
    onSkip
}) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleComplete = async () => {
        setIsCompleting(true);
        await onComplete();
        setIsCompleting(false);
    };

    const cardColor = type === 'truth' ? 'blue' : 'orange';
    const difficultyEmoji = difficulty === 'easy' ? '⭐' : difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐';

    return (
        <div className={styles.cardContainer}>
            <div
                className={`${styles.card} ${isFlipped ? styles.flipped : ''} ${styles[cardColor]}`}
                onClick={!isFlipped ? handleFlip : undefined}
            >
                {/* Front of card */}
                <div className={styles.cardFront}>
                    <div className={styles.cardType}>
                        {type === 'truth' ? '🤔' : '🎯'}
                    </div>
                    <h2 className={styles.cardTitle}>
                        {type === 'truth' ? 'TRUTH' : 'DARE'}
                    </h2>
                    <p className={styles.tapToReveal}>Tap to reveal</p>
                    <div className={styles.difficulty}>{difficultyEmoji}</div>
                </div>

                {/* Back of card */}
                <div className={styles.cardBack}>
                    <div className={styles.cardHeader}>
                        <span className={styles.badge}>{type.toUpperCase()}</span>
                        <span className={styles.difficultyBadge}>{difficulty}</span>
                    </div>

                    <div className={styles.questionContainer}>
                        <p className={styles.question}>{question}</p>
                    </div>

                    <div className={styles.categoryTag}>
                        {category.replace(/_/g, ' ')}
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={styles.skipButton}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSkip();
                            }}
                            disabled={isCompleting}
                        >
                            Skip
                        </button>
                        <button
                            className={styles.completeButton}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleComplete();
                            }}
                            disabled={isCompleting}
                        >
                            {isCompleting ? 'Completing...' : '✓ Complete'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizCard;
