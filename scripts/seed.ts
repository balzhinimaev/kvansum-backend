import mongoose from 'mongoose';
import { config } from 'dotenv';

// Загружаем переменные окружения
config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kvansum';

// Схемы
const UserSchema = new mongoose.Schema({
  telegramId: Number,
  username: String,
  firstName: String,
  lastName: String,
  email: String,
}, { timestamps: true });

const HabitSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  emoji: String,
  imageUrl: String,
  note: String,
  time: String,
  difficulty: String,
  period: String,
  streak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  totalDone: { type: Number, default: 0 },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

const HabitLogSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  habitId: mongoose.Schema.Types.ObjectId,
  date: Date,
  status: String,
  note: String,
  points: { type: Number, default: 0 },
}, { timestamps: true });

const UserStatsSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  totalPoints: { type: Number, default: 0 },
  currentLevel: { type: Number, default: 1 },
  currentRank: { type: String, default: 'beginner' },
  longestStreak: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  totalHabits: { type: Number, default: 0 },
  completedToday: { type: Number, default: 0 },
  lastActivityAt: { type: Date, default: Date.now },
}, { timestamps: true });

const ThoughtSchema = new mongoose.Schema({
  quote: String,
  author: String,
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const ArtefactSchema = new mongoose.Schema({
  title: String,
  emoji: String,
  description: String,
  tag: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Очищаем существующие данные
    console.log('🗑️  Clearing existing data...');
    await mongoose.connection.dropDatabase();
    console.log('✅ Database cleared');

    const User = mongoose.model('User', UserSchema);
    const Habit = mongoose.model('Habit', HabitSchema);
    const HabitLog = mongoose.model('HabitLog', HabitLogSchema);
    const UserStats = mongoose.model('UserStats', UserStatsSchema);
    const Thought = mongoose.model('Thought', ThoughtSchema);
    const Artefact = mongoose.model('Artefact', ArtefactSchema);

    // 1. Создаем тестового пользователя
    console.log('👤 Creating test user...');
    const testUser = await User.create({
      _id: 'test-user-1',
      username: 'test_user',
      firstName: 'Тестовый',
      lastName: 'Пользователь',
      email: 'test@example.com',
    });
    console.log('✅ Test user created:', testUser._id);

    // 2. Создаем статистику для пользователя
    console.log('📊 Creating user stats...');
    await UserStats.create({
      userId: testUser._id,
      totalPoints: 450,
      currentLevel: 5,
      currentRank: 'active',
      longestStreak: 12,
      currentStreak: 7,
      totalHabits: 3,
      completedToday: 2,
    });
    console.log('✅ User stats created');

    // 3. Создаем привычки
    console.log('🎯 Creating habits...');
    const habits = await Habit.create([
      {
        userId: testUser._id,
        name: 'Утренняя зарядка',
        emoji: '💪',
        note: '15 минут растяжки и упражнений',
        time: '07:00',
        difficulty: 'Средняя',
        period: 'Утро',
        streak: 7,
        bestStreak: 12,
        totalDone: 45,
        order: 0,
        isActive: true,
      },
      {
        userId: testUser._id,
        name: 'Медитация',
        emoji: '🧘',
        note: '10 минут утренней медитации',
        time: '07:30',
        difficulty: 'Легкая',
        period: 'Утро',
        streak: 5,
        bestStreak: 10,
        totalDone: 30,
        order: 1,
        isActive: true,
      },
      {
        userId: testUser._id,
        name: 'Чтение',
        emoji: '📚',
        note: 'Минимум 20 страниц',
        time: '21:00',
        difficulty: 'Легкая',
        period: 'Вечер',
        streak: 3,
        bestStreak: 8,
        totalDone: 25,
        order: 2,
        isActive: true,
      },
    ]);
    console.log('✅ Created', habits.length, 'habits');

    // 4. Создаем логи за последние 7 дней
    console.log('📝 Creating habit logs...');
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const logs = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      for (const habit of habits) {
        // Рандомный статус с большей вероятностью success
        const random = Math.random();
        let status = 'success';
        let points = 0;

        if (random > 0.7) {
          status = i === 0 ? 'pending' : 'fail';
        } else {
          // Начисляем очки для успешных выполнений
          const basePoints = habit.difficulty === 'Легкая' ? 10 : 20;
          points = basePoints + Math.min(habit.streak * 2, 50);
        }

        logs.push({
          userId: testUser._id,
          habitId: habit._id,
          date,
          status,
          points,
        });
      }
    }

    await HabitLog.insertMany(logs);
    console.log('✅ Created', logs.length, 'habit logs');

    // 5. Создаем мысли дня
    console.log('💭 Creating thoughts...');
    const thoughts = await Thought.create([
      {
        quote: 'Привычки — это сложные проценты самосовершенствования.',
        author: 'Джеймс Клир',
        order: 0,
      },
      {
        quote: 'Ты — то, что ты делаешь регулярно. Совершенство — не действие, а привычка.',
        author: 'Аристотель',
        order: 1,
      },
      {
        quote: 'Мотивация — это то, с чего ты начинаешь. Привычка — это то, что заставляет тебя продолжать.',
        author: 'Джим Рён',
        order: 2,
      },
      {
        quote: 'Сначала мы создаём привычки, затем привычки создают нас.',
        author: 'Чарльз Нобл',
        order: 3,
      },
      {
        quote: 'Успех — это сумма небольших усилий, повторяемых изо дня в день.',
        author: 'Роберт Кольер',
        order: 4,
      },
      {
        quote: 'Каждый день — это новая возможность стать лучше.',
        author: 'Kvansum',
        order: 5,
      },
      {
        quote: 'Путь в тысячу ли начинается с первого шага.',
        author: 'Лао-цзы',
        order: 6,
      },
      {
        quote: 'Не ждите. Время никогда не будет подходящим.',
        author: 'Наполеон Хилл',
        order: 7,
      },
      {
        quote: 'Маленькие ежедневные улучшения со временем приводят к впечатляющим результатам.',
        author: 'Робин Шарма',
        order: 8,
      },
      {
        quote: 'Секрет перемен в том, чтобы сфокусировать всю свою энергию не на борьбе со старым, а на создании нового.',
        author: 'Сократ',
        order: 9,
      },
    ]);
    console.log('✅ Created', thoughts.length, 'thoughts');

    // 6. Создаем артефакты
    console.log('🎨 Creating artefacts...');
    const artefacts = await Artefact.create([
      {
        title: 'Дневник успехов',
        emoji: '📓',
        description: 'Записывайте свои достижения каждый день',
        tag: 'рефлексия',
      },
      {
        title: 'Трекер настроения',
        emoji: '😊',
        description: 'Отслеживайте своё эмоциональное состояние',
        tag: 'трекер',
      },
      {
        title: 'Колесо баланса',
        emoji: '🎯',
        description: 'Оцените баланс различных сфер жизни',
        tag: 'диагностика',
      },
    ]);
    console.log('✅ Created', artefacts.length, 'artefacts');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log('  - Users:', 1);
    console.log('  - Habits:', habits.length);
    console.log('  - Habit Logs:', logs.length);
    console.log('  - Thoughts:', thoughts.length);
    console.log('  - Artefacts:', artefacts.length);
    console.log('\n👤 Test user ID: test-user-1');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Запускаем seed
seed();

