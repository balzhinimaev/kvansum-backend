import mongoose from 'mongoose';
import { config } from 'dotenv';

// Загружаем переменные окружения
config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kvansum';
const DB_NAME = process.env.DB_NAME || 'kvansum';

// Схемы
const UserSchema = new mongoose.Schema({
  telegramId: Number,
  username: String,
  firstName: String,
  lastName: String,
  email: String,
}, { timestamps: true });

const LevelSchema = new mongoose.Schema({
  id: String,
  order: Number,
  title: String,
  description: String,
  emoji: String,
  nextLevelId: String,
  unlockAfterDays: Number,
}, { timestamps: true });

const HabitSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  levelId: String,
  title: String,
  emoji: String,
  imageUrl: String,
  summary: String,
  note: String,
  difficulty: String, // easy, medium, hard
  timeOfDay: String, // morning, day, evening, summary
  days: [String], // ['daily'] или ['mon', 'wed']
  stages: [{ days: Number, title: String, description: String }],
  time: String,
  streak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  totalDone: { type: Number, default: 0 },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

const UserProgressSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  completionByDate: { type: Map, of: Object, default: {} },
  habitStreak: { type: Map, of: Number, default: {} },
  levelUnlockedAt: { type: Map, of: String, default: {} },
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
  id: String,
  title: String,
  body: String,
  unlock: Object,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Данные уровней из фронтенд моков
const LEVELS_DATA = [
  {
    id: 'lvl1',
    order: 1,
    title: 'Энергия и базовые ресурсы',
    description: 'Привычки, которые заряжают тело и запускают утро.',
    emoji: '🩵',
    nextLevelId: 'lvl2',
  },
  {
    id: 'lvl2',
    order: 2,
    title: 'Фокус и внимание',
    description: 'Собираем внимание и планируем день осознанно.',
    emoji: '🧠',
    nextLevelId: 'lvl3',
    unlockAfterDays: 21,
  },
  {
    id: 'lvl3',
    order: 3,
    title: 'Самоконтроль и психика',
    description: 'Укрепляем устойчивость к стрессу и внутренний контроль.',
    emoji: '🔥',
    nextLevelId: 'lvl4',
    unlockAfterDays: 21,
  },
  {
    id: 'lvl4',
    order: 4,
    title: 'Осознанность и рефлексия',
    description: 'Учимся наблюдать за собой и подводить итоги.',
    emoji: '🌿',
    nextLevelId: 'lvl5',
    unlockAfterDays: 21,
  },
  {
    id: 'lvl5',
    order: 5,
    title: 'Организация и порядок',
    description: 'Создаём устойчивые системы и порядок вокруг.',
    emoji: '⚙️',
    nextLevelId: 'lvl6',
    unlockAfterDays: 21,
  },
  {
    id: 'lvl6',
    order: 6,
    title: 'Рост и развитие',
    description: 'Расширяем горизонты, инвестируем в навыки.',
    emoji: '🚀',
    nextLevelId: 'lvl7',
    unlockAfterDays: 21,
  },
  {
    id: 'lvl7',
    order: 7,
    title: 'Архитектор жизни',
    description: 'Полная осознанность и собственная система привычек.',
    emoji: '🧩',
  },
];

// Данные привычек по уровням из фронтенд моков
const BASE_STAGES = [
  { days: 7, title: 'Первые ростки', description: 'Неделя дисциплины' },
  { days: 21, title: 'Укрепление корней', description: 'Формирование устойчивой привычки' },
  { days: 45, title: 'Молодое дерево', description: 'Привычка начинает работать на тебя' },
  { days: 60, title: 'Сильные ветви', description: 'Глубокая интеграция в систему' },
  { days: 89, title: 'Плодоносящее древо', description: 'Мастерство и изобилие' },
];

const HABITS_DATA = [
  // Уровень 1
  {
    id: 'h-water',
    levelId: 'lvl1',
    title: 'Стакан воды после пробуждения',
    difficulty: 'easy',
    timeOfDay: 'morning',
    days: ['daily'],
    emoji: '💧',
    summary: 'Запускает обмен веществ и помогает мозгу включиться без кофеина.',
    stages: BASE_STAGES,
  },
  {
    id: 'h-bed',
    levelId: 'lvl1',
    title: 'Заправить постель',
    difficulty: 'easy',
    timeOfDay: 'morning',
    days: ['daily'],
    emoji: '🛏️',
    summary: 'Первая завершённая задача дня — фундамент самоконтроля.',
    stages: BASE_STAGES,
  },
  {
    id: 'h-stretch',
    levelId: 'lvl1',
    title: 'Разминка 5–10 минут',
    difficulty: 'easy',
    timeOfDay: 'morning',
    days: ['daily'],
    emoji: '🧘',
    summary: 'Готовит тело к дню и снимает утренние зажимы.',
    stages: BASE_STAGES,
  },
  {
    id: 'h-cold',
    levelId: 'lvl1',
    title: 'Контрастный душ или умывание',
    difficulty: 'medium',
    timeOfDay: 'morning',
    days: ['daily'],
    emoji: '❄️',
    summary: 'Тонизирует сосуды и повышает стрессоустойчивость.',
    stages: BASE_STAGES,
  },

  // Уровень 2
  {
    id: 'h-3goals',
    levelId: 'lvl2',
    title: 'Записать три цели на день',
    difficulty: 'easy',
    timeOfDay: 'morning',
    days: ['daily'],
    emoji: '📝',
    summary: 'Фокусируем внимание на важном и задаём ритм дня.',
    stages: BASE_STAGES,
  },
  {
    id: 'h-no-phone',
    levelId: 'lvl2',
    title: 'Без телефона первый час',
    difficulty: 'medium',
    timeOfDay: 'morning',
    days: ['daily'],
    emoji: '📵',
    summary: 'Оставляем утреннюю энергию себе, а не ленте новостей.',
    stages: BASE_STAGES,
  },
  {
    id: 'h-read10',
    levelId: 'lvl2',
    title: 'Прочитать 10 страниц',
    difficulty: 'medium',
    timeOfDay: 'day',
    days: ['daily'],
    emoji: '📚',
    summary: 'Короткая сессия чтения подпитывает мозг идеями.',
    stages: BASE_STAGES,
  },
  {
    id: 'h-walk15',
    levelId: 'lvl2',
    title: 'Прогулка 15 минут без гаджета',
    difficulty: 'easy',
    timeOfDay: 'day',
    days: ['daily'],
    emoji: '🚶',
    summary: 'Перезагрузка внимания и лёгкая физическая активность.',
    stages: BASE_STAGES,
  },

  // Уровень 3
  {
    id: 'h-journal',
    levelId: 'lvl3',
    title: 'Вечерний журнал на 5 минут',
    difficulty: 'medium',
    timeOfDay: 'evening',
    days: ['daily'],
    emoji: '🪶',
    summary: 'Рефлексия фиксирует уроки дня и снимает напряжение.',
    stages: BASE_STAGES,
  },
  {
    id: 'h-no-sugar',
    levelId: 'lvl3',
    title: 'Без сахара до обеда',
    difficulty: 'hard',
    timeOfDay: 'day',
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    emoji: '🥗',
    summary: 'Стабилизирует энергию и избегает резких падений концентрации.',
    stages: BASE_STAGES,
  },
  {
    id: 'h-breath',
    levelId: 'lvl3',
    title: '5 минут дыхательной практики',
    difficulty: 'medium',
    timeOfDay: 'evening',
    days: ['daily'],
    emoji: '🌬️',
    summary: 'Короткая практика успокаивает нервную систему.',
    stages: BASE_STAGES,
  },

  // Уровень 4
  {
    id: 'h-meditate10',
    levelId: 'lvl4',
    title: 'Медитация 10 минут',
    difficulty: 'medium',
    timeOfDay: 'evening',
    days: ['daily'],
    emoji: '🧘‍♀️',
    summary: 'Развивает наблюдательность и снижает уровень стресса.',
    stages: BASE_STAGES,
  },
  {
    id: 'h-gratitude',
    levelId: 'lvl4',
    title: '3 пункта благодарности',
    difficulty: 'easy',
    timeOfDay: 'summary',
    days: ['daily'],
    emoji: '✨',
    summary: 'Фокусируемся на позитивном опыте дня.',
    stages: BASE_STAGES,
  },
  {
    id: 'h-digital-sunset',
    levelId: 'lvl4',
    title: 'Цифровой закат за час до сна',
    difficulty: 'medium',
    timeOfDay: 'evening',
    days: ['daily'],
    emoji: '🌙',
    summary: 'Разгружаем мозг перед сном и улучшаем качество отдыха.',
    stages: BASE_STAGES,
  },

  // Уровень 5
  {
    id: 'h-plan-evening',
    levelId: 'lvl5',
    title: 'Вечерний план на завтра',
    difficulty: 'medium',
    timeOfDay: 'summary',
    days: ['daily'],
    emoji: '🗂️',
    summary: 'Позволяет просыпаться с готовым планом и без тревоги.',
    stages: BASE_STAGES,
  },
  {
    id: 'h-inbox-zero',
    levelId: 'lvl5',
    title: 'Пустой ящик в конце дня',
    difficulty: 'hard',
    timeOfDay: 'summary',
    days: ['mon', 'wed', 'fri'],
    emoji: '📥',
    summary: 'Поддерживаем порядок в задачах и голове.',
    stages: BASE_STAGES,
  },
  {
    id: 'h-clean-desk',
    levelId: 'lvl5',
    title: 'Чистое рабочее место к вечеру',
    difficulty: 'easy',
    timeOfDay: 'summary',
    days: ['daily'],
    emoji: '🧽',
    summary: 'Завершаем день, создавая ясное пространство на завтра.',
    stages: BASE_STAGES,
  },

  // Уровень 6
  {
    id: 'h-learning',
    levelId: 'lvl6',
    title: '45 минут обучения навыку',
    difficulty: 'medium',
    timeOfDay: 'day',
    days: ['mon', 'wed', 'fri'],
    emoji: '🎓',
    summary: 'Инвестируем в развитие, закрепляя новую компетенцию.',
    stages: BASE_STAGES,
  },
  {
    id: 'h-network',
    levelId: 'lvl6',
    title: 'Сообщение наставнику/партнёру',
    difficulty: 'easy',
    timeOfDay: 'day',
    days: ['tue', 'thu', 'sat'],
    emoji: '🤝',
    summary: 'Поддерживаем связи и получаем обратную связь.',
    stages: BASE_STAGES,
  },
  {
    id: 'h-project',
    levelId: 'lvl6',
    title: '90 минут глубокой работы',
    difficulty: 'hard',
    timeOfDay: 'day',
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    emoji: '🛠️',
    summary: 'Продвигаем ключевой проект без отвлечений.',
    stages: BASE_STAGES,
  },

  // Уровень 7
  {
    id: 'h-mentor',
    levelId: 'lvl7',
    title: 'Наставничество: одна сессия в неделю',
    difficulty: 'hard',
    timeOfDay: 'day',
    days: ['sat'],
    emoji: '🧭',
    summary: 'Делиться опытом — финальный этап интеграции привычек.',
    stages: BASE_STAGES,
  },
  {
    id: 'h-vision',
    levelId: 'lvl7',
    title: 'Ревизия личной стратегии',
    difficulty: 'medium',
    timeOfDay: 'summary',
    days: ['sun'],
    emoji: '🧱',
    summary: 'Каждую неделю оцениваем систему и корректируем курс.',
    stages: BASE_STAGES,
  },
  {
    id: 'h-giveback',
    levelId: 'lvl7',
    title: 'Вклад в сообщество',
    difficulty: 'medium',
    timeOfDay: 'day',
    days: ['sun'],
    emoji: '🎁',
    summary: 'Закрепляем идентичность архитектора благодаря отданному.',
    stages: BASE_STAGES,
  },
];

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      dbName: DB_NAME,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
    });
    console.log('✅ Connected to MongoDB');

    // Очищаем существующие данные
    console.log('🗑️  Clearing existing data...');
    await mongoose.connection.dropDatabase();
    console.log('✅ Database cleared');

    const User = mongoose.model('User', UserSchema);
    const Level = mongoose.model('Level', LevelSchema);
    const Habit = mongoose.model('Habit', HabitSchema);
    const UserProgress = mongoose.model('UserProgress', UserProgressSchema);
    const HabitLog = mongoose.model('HabitLog', HabitLogSchema);
    const UserStats = mongoose.model('UserStats', UserStatsSchema);
    const Thought = mongoose.model('Thought', ThoughtSchema);
    const Artefact = mongoose.model('Artefact', ArtefactSchema);

    // 1. Создаем тестового пользователя
    console.log('👤 Creating test user...');
    const testUser = await User.create({
      username: 'test_user',
      firstName: 'Тестовый',
      lastName: 'Пользователь',
      email: 'test@example.com',
    });
    console.log('✅ Test user created:', testUser._id);

    // 2. Создаем уровни
    console.log('🎯 Creating levels...');
    await Level.insertMany(LEVELS_DATA);
    console.log('✅ Created', LEVELS_DATA.length, 'levels');

    // 3. Создаем привычки
    console.log('🎯 Creating habits...');
    const habits = await Habit.insertMany(
      HABITS_DATA.map(h => ({
        ...h,
        userId: testUser._id,
        streak: Math.floor(Math.random() * 20),
        bestStreak: Math.floor(Math.random() * 30),
        totalDone: Math.floor(Math.random() * 100),
      }))
    );
    console.log('✅ Created', habits.length, 'habits');

    // 4. Создаем прогресс пользователя
    console.log('📊 Creating user progress...');
    const habitStreak = new Map();
    habits.forEach(h => {
      habitStreak.set(h.id, h.streak);
    });

    await UserProgress.create({
      userId: testUser._id,
      completionByDate: new Map(),
      habitStreak,
      levelUnlockedAt: new Map([
        ['lvl1', '2025-09-01'],
        ['lvl2', undefined],
        ['lvl3', undefined],
        ['lvl4', undefined],
        ['lvl5', undefined],
        ['lvl6', undefined],
        ['lvl7', undefined],
      ]),
    });
    console.log('✅ User progress created');

    // 5. Создаем статистику для пользователя
    console.log('📊 Creating user stats...');
    await UserStats.create({
      userId: testUser._id,
      totalPoints: 450,
      currentLevel: 5,
      currentRank: 'active',
      longestStreak: 18,
      currentStreak: 12,
      totalHabits: habits.length,
      completedToday: 2,
    });
    console.log('✅ User stats created');

    // 6. Создаем мысли дня
    console.log('💭 Creating thoughts...');
    const thoughts = await Thought.insertMany([
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

    // 7. Создаем артефакты из фронтенд моков
    console.log('🎨 Creating artefacts...');
    const artefacts = await Artefact.insertMany([
      {
        id: 'art-water-7',
        title: 'Почему важно пить воду утром',
        body: 'Гидратация запускает обмен веществ и делает мозг яснее без кофеина.',
        unlock: { type: 'habit_stage', habitId: 'h-water', days: 7 },
      },
      {
        id: 'art-bed-21',
        title: 'Первая победа дня',
        body: 'Заправленная постель формирует петлю «начал → закончил» и даёт быстрый дофамин.',
        unlock: { type: 'habit_stage', habitId: 'h-bed', days: 21 },
      },
      {
        id: 'art-stretch-45',
        title: 'Эластичность тела = гибкость мышления',
        body: 'Регулярные растяжки снижают тревожность и улучшают пластичность мышления.',
        unlock: { type: 'habit_stage', habitId: 'h-stretch', days: 45 },
      },
      {
        id: 'art-level1',
        title: 'Готов к «Фокусу и вниманию»',
        body: 'Ты выстроил фундамент энергии — теперь переходи к управлению вниманием и задачами.',
        unlock: { type: 'level_progress', levelId: 'lvl1', threshold: 0.3 },
      },
      {
        id: 'art-journal-21',
        title: 'Сила вечернего журнала',
        body: 'Короткая запись закрывает день, фиксирует инсайты и снижает стресс перед сном.',
        unlock: { type: 'habit_stage', habitId: 'h-journal', days: 21 },
      },
      {
        id: 'art-level2',
        title: 'Следующий шаг — самоконтроль',
        body: 'Два стрика по 30 дней на уровне фокуса — и ты готов работать с самоконтролем.',
        unlock: { type: 'level_progress', levelId: 'lvl2', threshold: 0.3 },
      },
    ]);
    console.log('✅ Created', artefacts.length, 'artefacts');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log('  - Users:', 1);
    console.log('  - Levels:', LEVELS_DATA.length);
    console.log('  - Habits:', habits.length);
    console.log('  - Thoughts:', thoughts.length);
    console.log('  - Artefacts:', artefacts.length);
    console.log('\n👤 Test user ID:', testUser._id.toString());
    console.log('\n💡 Use these endpoints:');
    console.log('  - GET /api/habits - All habits');
    console.log('  - GET /api/levels - All levels');
    console.log('  - GET /api/progress - User progress');

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

