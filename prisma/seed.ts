import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const truthCards = [
    // Nutrition Basics
    { type: 'truth', question: 'How many servings of vegetables should adults eat daily? (Answer: 3-5 servings)', difficulty: 'easy', category: 'nutrition_basics' },
    { type: 'truth', question: 'True or False: Drinking water helps boost your metabolism.', difficulty: 'easy', category: 'nutrition_basics' },
    { type: 'truth', question: 'What percentage of your plate should be filled with fruits and vegetables? (Answer: About 50%)', difficulty: 'easy', category: 'nutrition_basics' },
    { type: 'truth', question: 'How many grams of protein per kg of body weight do adults need daily? (Answer: 0.8-1g)', difficulty: 'medium', category: 'nutrition_basics' },
    { type: 'truth', question: 'True or False: All fats are bad for your health.', difficulty: 'easy', category: 'nutrition_basics' },

    // Food Facts
    { type: 'truth', question: 'Which has more vitamin C: an orange or a red bell pepper? (Answer: Red bell pepper)', difficulty: 'medium', category: 'food_facts' },
    { type: 'truth', question: 'True or False: Brown eggs are more nutritious than white eggs.', difficulty: 'easy', category: 'food_facts' },
    { type: 'truth', question: 'What nutrient is spinach particularly rich in? (Answer: Iron and folate)', difficulty: 'easy', category: 'food_facts' },
    { type: 'truth', question: 'How many calories are in one gram of fat? (Answer: 9 calories)', difficulty: 'medium', category: 'food_facts' },
    { type: 'truth', question: 'True or False: Eating carrots can improve your night vision.', difficulty: 'easy', category: 'food_facts' },

    // Healthy Habits
    { type: 'truth', question: 'How many hours before bed should you stop eating for better sleep? (Answer: 2-3 hours)', difficulty: 'medium', category: 'healthy_habits' },
    { type: 'truth', question: 'True or False: Skipping breakfast slows down your metabolism.', difficulty: 'medium', category: 'healthy_habits' },
    { type: 'truth', question: 'What is the recommended daily water intake for adults? (Answer: 8-10 glasses or 2-3 liters)', difficulty: 'easy', category: 'healthy_habits' },
    { type: 'truth', question: 'How many times should you chew each bite of food for optimal digestion? (Answer: 20-30 times)', difficulty: 'hard', category: 'healthy_habits' },
    { type: 'truth', question: 'True or False: Eating slowly helps you eat less and feel fuller.', difficulty: 'easy', category: 'healthy_habits' },

    // Sugar & Processed Foods
    { type: 'truth', question: 'How many teaspoons of sugar are in a typical can of soda? (Answer: 8-10 teaspoons)', difficulty: 'medium', category: 'sugar_awareness' },
    { type: 'truth', question: 'True or False: Natural sugars in fruit are the same as added sugars in candy.', difficulty: 'medium', category: 'sugar_awareness' },
    { type: 'truth', question: 'What is the WHO recommended daily limit for added sugar? (Answer: 25g or 6 teaspoons)', difficulty: 'hard', category: 'sugar_awareness' },
    { type: 'truth', question: 'True or False: "Sugar-free" products are always healthier.', difficulty: 'easy', category: 'sugar_awareness' },
    { type: 'truth', question: 'Which has more sugar: a banana or a chocolate chip cookie? (Answer: Usually the cookie)', difficulty: 'easy', category: 'sugar_awareness' },

    // Vitamins & Minerals
    { type: 'truth', question: 'What vitamin does your body produce when exposed to sunlight? (Answer: Vitamin D)', difficulty: 'easy', category: 'vitamins_minerals' },
    { type: 'truth', question: 'True or False: You can get all your calcium from non-dairy sources.', difficulty: 'medium', category: 'vitamins_minerals' },
    { type: 'truth', question: 'Which mineral is essential for healthy blood and prevents anemia? (Answer: Iron)', difficulty: 'easy', category: 'vitamins_minerals' },
    { type: 'truth', question: 'What vitamin is crucial for blood clotting? (Answer: Vitamin K)', difficulty: 'hard', category: 'vitamins_minerals' },
    { type: 'truth', question: 'True or False: Taking too many vitamin supplements can be harmful.', difficulty: 'medium', category: 'vitamins_minerals' },

    // Portion Control
    { type: 'truth', question: 'What is a healthy portion size for cooked rice or pasta? (Answer: About 1/2 cup or size of your fist)', difficulty: 'medium', category: 'portion_control' },
    { type: 'truth', question: 'True or False: Using smaller plates can help you eat less.', difficulty: 'easy', category: 'portion_control' },
    { type: 'truth', question: 'How much protein should fit on your plate? (Answer: About 1/4 or palm-sized portion)', difficulty: 'medium', category: 'portion_control' },
    { type: 'truth', question: 'True or False: Restaurant portions are typically 2-3 times larger than recommended servings.', difficulty: 'easy', category: 'portion_control' },
    { type: 'truth', question: 'What is a healthy snack portion of nuts? (Answer: About 1/4 cup or a small handful)', difficulty: 'medium', category: 'portion_control' },
];

const dareCards = [
    // Hydration Challenges
    { type: 'dare', question: 'Drink a full glass of water right now! 💧', difficulty: 'easy', category: 'hydration' },
    { type: 'dare', question: 'Set a timer to drink water every hour for the rest of today.', difficulty: 'medium', category: 'hydration' },
    { type: 'dare', question: 'Replace your next sugary drink with water or herbal tea.', difficulty: 'easy', category: 'hydration' },
    { type: 'dare', question: 'Add lemon or cucumber slices to your water for extra flavor today.', difficulty: 'easy', category: 'hydration' },
    { type: 'dare', question: 'Drink a glass of water before each meal today.', difficulty: 'medium', category: 'hydration' },

    // Healthy Swaps
    { type: 'dare', question: 'Swap your usual snack for a piece of fruit today. 🍎', difficulty: 'easy', category: 'healthy_swaps' },
    { type: 'dare', question: 'Replace white bread with whole grain for your next meal.', difficulty: 'easy', category: 'healthy_swaps' },
    { type: 'dare', question: 'Choose baked or grilled instead of fried for your next protein.', difficulty: 'medium', category: 'healthy_swaps' },
    { type: 'dare', question: 'Swap soda for sparkling water with a splash of juice.', difficulty: 'easy', category: 'healthy_swaps' },
    { type: 'dare', question: 'Use Greek yogurt instead of sour cream in your next recipe.', difficulty: 'medium', category: 'healthy_swaps' },

    // Mindful Eating
    { type: 'dare', question: 'Eat your next meal without any screens or distractions. 🧘', difficulty: 'medium', category: 'mindful_eating' },
    { type: 'dare', question: 'Chew each bite 20 times during your next meal.', difficulty: 'hard', category: 'mindful_eating' },
    { type: 'dare', question: 'Put your fork down between bites during your next meal.', difficulty: 'medium', category: 'mindful_eating' },
    { type: 'dare', question: 'Take 3 deep breaths before starting your next meal.', difficulty: 'easy', category: 'mindful_eating' },
    { type: 'dare', question: 'Eat with your non-dominant hand for one meal to slow down.', difficulty: 'hard', category: 'mindful_eating' },

    // Veggie Challenges
    { type: 'dare', question: 'Add an extra serving of vegetables to your next meal. 🥦', difficulty: 'easy', category: 'vegetables' },
    { type: 'dare', question: 'Try a new vegetable you\'ve never eaten before this week.', difficulty: 'medium', category: 'vegetables' },
    { type: 'dare', question: 'Make vegetables the star of your next meal (not just a side).', difficulty: 'medium', category: 'vegetables' },
    { type: 'dare', question: 'Eat a rainbow! Include 3 different colored vegetables today.', difficulty: 'medium', category: 'vegetables' },
    { type: 'dare', question: 'Start your day with vegetables (add spinach to your eggs or smoothie).', difficulty: 'hard', category: 'vegetables' },

    // Portion Control
    { type: 'dare', question: 'Use a smaller plate for your next meal. 🍽️', difficulty: 'easy', category: 'portion_control' },
    { type: 'dare', question: 'Measure your portions for one full day to learn proper serving sizes.', difficulty: 'hard', category: 'portion_control' },
    { type: 'dare', question: 'Fill half your plate with vegetables at your next meal.', difficulty: 'easy', category: 'portion_control' },
    { type: 'dare', question: 'Stop eating when you\'re 80% full at your next meal.', difficulty: 'medium', category: 'portion_control' },
    { type: 'dare', question: 'Pack your lunch in a bento box to control portions tomorrow.', difficulty: 'medium', category: 'portion_control' },

    // Movement & Activity
    { type: 'dare', question: 'Do 10 jumping jacks right now! 🏃', difficulty: 'easy', category: 'movement' },
    { type: 'dare', question: 'Take a 10-minute walk after your next meal.', difficulty: 'medium', category: 'movement' },
    { type: 'dare', question: 'Stand up and stretch for 2 minutes right now.', difficulty: 'easy', category: 'movement' },
    { type: 'dare', question: 'Take the stairs instead of the elevator today.', difficulty: 'easy', category: 'movement' },
    { type: 'dare', question: 'Do 20 squats before your next meal.', difficulty: 'medium', category: 'movement' },
];

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing quiz data
    await prisma.quizAttempt.deleteMany({});
    await prisma.quizCard.deleteMany({});
    console.log('✅ Cleared existing quiz data');

    // Seed Truth cards
    console.log('📚 Seeding Truth cards...');
    for (const card of truthCards) {
        await prisma.quizCard.create({
            data: card,
        });
    }
    console.log(`✅ Created ${truthCards.length} Truth cards`);

    // Seed Dare cards
    console.log('🎯 Seeding Dare cards...');
    for (const card of dareCards) {
        await prisma.quizCard.create({
            data: card,
        });
    }
    console.log(`✅ Created ${dareCards.length} Dare cards`);

    console.log(`\n🎉 Seed completed successfully!`);
    console.log(`📊 Total cards: ${truthCards.length + dareCards.length}`);
    console.log(`   - Truth cards: ${truthCards.length}`);
    console.log(`   - Dare cards: ${dareCards.length}`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
