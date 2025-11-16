import { useState, useEffect, useCallback } from 'react';
import { Coins, TrendingUp, BookOpen, ArrowLeft, Trophy, Star, Target, ShoppingBag, User, Gift, Settings, Crown, Zap } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { BudgetSimulator } from './components/BudgetSimulator';
import { Quiz } from './components/Quiz';
import { Progress } from './components/ui/progress';
import { Shop } from './components/Shop';
import { Input } from './components/ui/input';
import { toast, Toaster } from 'sonner@2.0.3';

type Screen = 'login' | 'register' | 'home' | 'quiz' | 'budget' | 'stats' | 'quiz-select' | 'shop' | 'profile' | 'history';
type QuizCategory = 'basics' | 'saving' | 'budget' | 'investing' | 'mixed';

interface PowerUp {
  type: 'hint' | 'skip' | 'double-coins' | 'xp-boost' | 'streak-save';
  expiresAt?: number;
}

interface QuizHistory {
  id: string;
  category: QuizCategory;
  score: number;
  total: number;
  date: number;
  coinsEarned: number;
}

interface UserStats {
  username: string;
  avatar: string;
  coins: number;
  totalQuizzes: number;
  perfectScores: number;
  bestStreak: number;
  level: number;
  xp: number;
  categoryScores: Record<QuizCategory, { played: number; avgScore: number }>;
  achievements: string[];
  purchasedItems: string[];
  theme: string;
  dailyStreak: number;
  lastLogin: string;
  dailyTasksCompleted: string[];
  powerUps: PowerUp[];
  quizHistory: QuizHistory[];
  totalCoinsEarned: number;
  totalCoinsSpent: number;
}

const THEMES = {
  default: { primary: 'from-purple-500 to-pink-500', name: 'Фиолетовый', secondary: 'purple' },
  ocean: { primary: 'from-blue-500 to-cyan-500', name: 'Океан', secondary: 'blue' },
  sunset: { primary: 'from-orange-500 to-red-500', name: 'Закат', secondary: 'orange' },
  forest: { primary: 'from-green-500 to-emerald-500', name: 'Лес', secondary: 'green' },
  gold: { primary: 'from-yellow-500 to-amber-500', name: 'Золото', secondary: 'yellow' },
  night: { primary: 'from-indigo-900 to-purple-900', name: 'Ночь', secondary: 'indigo' },
};

const STARTER_AVATARS = ['👤', '👨‍🎓', '👩‍🎓', '🧑‍💼', '👨‍💻', '👩‍💻', '🧙‍♂️', '🧙‍♀️'];

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory>('mixed');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👤');
  const [loginError, setLoginError] = useState('');
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [coinAmount, setCoinAmount] = useState(0);

  // Проверка при загрузке
  useEffect(() => {
    const saved = localStorage.getItem('finansy-stats');
    if (saved) {
      const userData = JSON.parse(saved);
      // Миграция старых данных
      const migratedData = {
        ...userData,
        powerUps: userData.powerUps || [],
        quizHistory: userData.quizHistory || [],
        totalCoinsEarned: userData.totalCoinsEarned || 0,
        totalCoinsSpent: userData.totalCoinsSpent || 0,
        dailyTasksCompleted: userData.dailyTasksCompleted || [],
        purchasedItems: userData.purchasedItems || []
      };
      setStats(migratedData);
      setScreen('home');
      checkDailyStreak(migratedData);
      showDailyBonus(migratedData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Сохранение статистики
  useEffect(() => {
    if (stats) {
      localStorage.setItem('finansy-stats', JSON.stringify(stats));
    }
  }, [stats]);

  const showDailyBonus = (userData: UserStats) => {
    const today = new Date().toDateString();
    const lastLogin = new Date(userData.lastLogin || today).toDateString();
    
    if (lastLogin !== today && userData.dailyStreak > 0) {
      const bonus = Math.min(userData.dailyStreak * 10, 100);
      setTimeout(() => {
        toast.success(`🎁 Ежедневный бонус: +${bonus} тенге за ${userData.dailyStreak} дней подряд!`);
        animateCoins(bonus);
      }, 1000);
      
      setStats(prev => prev ? {
        ...prev,
        coins: prev.coins + bonus,
        totalCoinsEarned: prev.totalCoinsEarned + bonus
      } : null);
    }
  };

  const animateCoins = (amount: number) => {
    setCoinAmount(amount);
    setShowCoinAnimation(true);
    setTimeout(() => setShowCoinAnimation(false), 2000);
  };

  const checkDailyStreak = (userData: UserStats) => {
    const today = new Date().toDateString();
    const lastLogin = new Date(userData.lastLogin || today).toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastLogin !== today) {
      if (lastLogin === yesterday) {
        setStats({
          ...userData,
          dailyStreak: userData.dailyStreak + 1,
          lastLogin: today,
          dailyTasksCompleted: []
        });
      } else if (lastLogin !== today) {
        setStats({
          ...userData,
          dailyStreak: 1,
          lastLogin: today,
          dailyTasksCompleted: []
        });
      }
    }
  };

  const handleRegister = () => {
    if (username.trim().length < 3) {
      setLoginError('Имя должно быть ��инимум 3 символа');
      return;
    }

    const newStats: UserStats = {
      username: username.trim(),
      avatar: selectedAvatar,
      coins: 200, // Больше стартовых монет
      totalCoinsEarned: 200,
      totalCoinsSpent: 0,
      totalQuizzes: 0,
      perfectScores: 0,
      bestStreak: 0,
      level: 1,
      xp: 0,
      categoryScores: {
        basics: { played: 0, avgScore: 0 },
        saving: { played: 0, avgScore: 0 },
        budget: { played: 0, avgScore: 0 },
        investing: { played: 0, avgScore: 0 },
        mixed: { played: 0, avgScore: 0 }
      },
      achievements: [],
      purchasedItems: [],
      theme: 'default',
      dailyStreak: 1,
      lastLogin: new Date().toDateString(),
      dailyTasksCompleted: [],
      powerUps: [],
      quizHistory: []
    };

    setStats(newStats);
    toast.success(`🎉 Добро пожаловать, ${username}! Получено 200 тенге!`);
    animateCoins(200);
    setScreen('home');
  };

  const handleQuizComplete = (score: number, total: number, category: QuizCategory, usedPowerUps: string[]) => {
    if (!stats) return;

    const percentage = (score / total) * 100;
    
    // Базовые награды
    let coinsEarned = score * 10;
    let xpEarned = score * 5;

    // Бонусы за результат
    if (percentage === 100) {
      coinsEarned += 50;
      xpEarned += 25;
      toast.success('🎉 Идеальный результат! +50 бонусных монет!');
    } else if (percentage >= 80) {
      coinsEarned += 20;
      xpEarned += 10;
      toast.success('👏 Отличный результат! +20 бонусных монет!');
    }

    // Проверка активных усилений
    const doubleCoinsActive = stats.powerUps.some(p => 
      p.type === 'double-coins' && (!p.expiresAt || p.expiresAt > Date.now())
    );
    const xpBoostActive = stats.powerUps.some(p => 
      p.type === 'xp-boost' && (!p.expiresAt || p.expiresAt > Date.now())
    );

    if (doubleCoinsActive) {
      coinsEarned *= 2;
      toast.success('🪙 Двойные монеты активны! x2 монет!');
    }
    if (xpBoostActive) {
      xpEarned = Math.floor(xpEarned * 1.5);
      toast.success('⚡ Ускоритель XP активен! +50% XP!');
    }

    // Бонус за ежедневную серию
    if (stats.dailyStreak >= 3) {
      const streakBonus = stats.dailyStreak * 5;
      coinsEarned += streakBonus;
      toast.success(`🔥 Бонус за серию ${stats.dailyStreak} дней: +${streakBonus} монет!`);
    }

    // Обновление статистики категории
    const categoryStats = stats.categoryScores[category];
    const newAvgScore = ((categoryStats.avgScore * categoryStats.played) + percentage) / (categoryStats.played + 1);

    const newStats = {
      ...stats,
      coins: stats.coins + coinsEarned,
      totalCoinsEarned: stats.totalCoinsEarned + coinsEarned,
      totalQuizzes: stats.totalQuizzes + 1,
      perfectScores: percentage === 100 ? stats.perfectScores + 1 : stats.perfectScores,
      xp: stats.xp + xpEarned,
      categoryScores: {
        ...stats.categoryScores,
        [category]: {
          played: categoryStats.played + 1,
          avgScore: newAvgScore
        }
      },
      quizHistory: [
        {
          id: Date.now().toString(),
          category,
          score,
          total,
          date: Date.now(),
          coinsEarned
        },
        ...stats.quizHistory.slice(0, 19) // Храним последние 20
      ]
    };

    // Расчет уровня
    const oldLevel = stats.level;
    newStats.level = Math.floor(newStats.xp / 100) + 1;
    
    if (newStats.level > oldLevel) {
      const levelBonus = 50;
      newStats.coins += levelBonus;
      newStats.totalCoinsEarned += levelBonus;
      toast.success(`🎊 Поздравляем! Уровень ${newStats.level}! +${levelBonus} монет!`);
    }

    // Проверка достижений
    checkAchievements(newStats);

    // Проверка ежедневных заданий
    checkDailyTasks(newStats, 'quiz');
    if (percentage === 100) {
      checkDailyTasks(newStats, 'perfect');
    }

    animateCoins(coinsEarned);
    setStats(newStats);
    setScreen('home');
  };

  const handleBudgetComplete = () => {
    if (!stats) return;
    
    const coinsEarned = 75;
    const xpEarned = 30;

    const newStats = {
      ...stats,
      coins: stats.coins + coinsEarned,
      totalCoinsEarned: stats.totalCoinsEarned + coinsEarned,
      xp: stats.xp + xpEarned,
      level: Math.floor((stats.xp + xpEarned) / 100) + 1
    };

    checkDailyTasks(newStats, 'budget');
    toast.success(`💰 Симулятор завершен! +${coinsEarned} монет!`);
    animateCoins(coinsEarned);
    setStats(newStats);
    setScreen('home');
  };

  const checkDailyTasks = (newStats: UserStats, taskType: string) => {
    const tasks = ['quiz', 'budget', 'perfect'];
    const completed = newStats.dailyTasksCompleted || [];
    if (!completed.includes(taskType) && tasks.includes(taskType)) {
      newStats.dailyTasksCompleted = [...completed, taskType];
      newStats.coins += 25;
      newStats.totalCoinsEarned += 25;
      toast.success('✅ Ежедневное задание выполнено! +25 монет!');
    }
  };

  const checkAchievements = (newStats: UserStats) => {
    const achievements: string[] = [...newStats.achievements];
    let newAchievements = 0;

    const toCheck = [
      { id: 'first-quiz', condition: newStats.totalQuizzes === 1, name: 'Первый шаг' },
      { id: 'quiz-expert', condition: newStats.totalQuizzes === 10, name: 'Эксперт' },
      { id: 'quiz-master', condition: newStats.totalQuizzes === 50, name: 'Мастер квизов' },
      { id: 'quiz-legend', condition: newStats.totalQuizzes === 100, name: 'Легенда' },
      { id: 'perfectionist', condition: newStats.perfectScores === 5, name: 'Перфекционист' },
      { id: 'perfect-10', condition: newStats.perfectScores === 10, name: 'Безупречный' },
      { id: 'perfect-25', condition: newStats.perfectScores === 25, name: 'Идеальный' },
      { id: 'rich', condition: newStats.totalCoinsEarned >= 500, name: 'Богач' },
      { id: 'millionaire', condition: newStats.totalCoinsEarned >= 1000, name: 'Миллионер' },
      { id: 'mega-rich', condition: newStats.totalCoinsEarned >= 2000, name: 'Мега-богач' },
      { id: 'billionaire', condition: newStats.totalCoinsEarned >= 5000, name: 'Миллиардер' },
      { id: 'level-5', condition: newStats.level >= 5, name: 'Мастер 5' },
      { id: 'level-10', condition: newStats.level >= 10, name: 'Легенда 10' },
      { id: 'level-20', condition: newStats.level >= 20, name: 'Титан 20' },
      { id: 'streak-7', condition: newStats.dailyStreak >= 7, name: 'Неделя подряд' },
      { id: 'streak-30', condition: newStats.dailyStreak >= 30, name: 'Месяц подряд' },
      { id: 'streak-100', condition: newStats.dailyStreak >= 100, name: '100 дней' },
    ];

    toCheck.forEach(({ id, condition, name }) => {
      if (condition && !achievements.includes(id)) {
        achievements.push(id);
        newStats.coins += 100;
        newStats.totalCoinsEarned += 100;
        newAchievements++;
        toast.success(`🏆 Достижение разблокировано: ${name}! +100 монет!`);
      }
    });

    newStats.achievements = achievements;
  };

  const handlePurchase = (itemId: string, cost: number) => {
    if (!stats || stats.coins < cost) {
      toast.error('Недостаточно монет!');
      return;
    }

    setStats({
      ...stats,
      coins: stats.coins - cost,
      totalCoinsSpent: stats.totalCoinsSpent + cost,
      purchasedItems: [...stats.purchasedItems, itemId]
    });
    
    toast.success('✅ Покупка успешна!');
  };

  const handlePowerUpPurchase = (powerUp: PowerUp, cost: number) => {
    if (!stats || stats.coins < cost) {
      toast.error('Недостаточно монет!');
      return;
    }

    const newPowerUp: PowerUp = {
      type: powerUp.type,
      expiresAt: powerUp.type === 'double-coins' || powerUp.type === 'xp-boost' 
        ? Date.now() + 24 * 60 * 60 * 1000 
        : undefined
    };

    setStats({
      ...stats,
      coins: stats.coins - cost,
      totalCoinsSpent: stats.totalCoinsSpent + cost,
      powerUps: [...stats.powerUps, newPowerUp]
    });

    toast.success(`✅ Усиление "${getPowerUpName(powerUp.type)}" приобретено!`);
  };

  const getPowerUpName = (type: string) => {
    const names: Record<string, string> = {
      'hint': 'Подсказка',
      'skip': 'Пропуск вопроса',
      'double-coins': 'Двойные монеты',
      'xp-boost': 'Ускоритель XP',
      'streak-save': 'Защита серии'
    };
    return names[type] || type;
  };

  const handleThemeChange = (theme: string) => {
    if (!stats) return;
    setStats({ ...stats, theme });
    toast.success(`🎨 Тема изменена на "${THEMES[theme as keyof typeof THEMES].name}"`);
  };

  const handleAvatarChange = (avatar: string) => {
    if (!stats) return;
    setStats({ ...stats, avatar });
    toast.success('✅ Аватар изменен!');
  };

  const handleUsernameChange = (newUsername: string) => {
    if (!stats) return;
    if (newUsername.trim().length < 3) {
      toast.error('Имя должно быт�� минимум 3 символа');
      return;
    }
    setStats({ ...stats, username: newUsername.trim() });
    toast.success('✅ Имя изменено!');
  };

  // Экран входа/регистрации
  if (!stats) {
    if (screen === 'register') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-purple-500 to-pink-500 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm p-8">
            <div className="text-center mb-6">
              <div className="inline-block bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-4 mb-4">
                <Coins className="w-16 h-16 text-white" />
              </div>
              <h1 className="mb-2">Регистрация</h1>
              <p className="text-muted-foreground">Создай свой профиль и начни учиться!</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Твое имя</label>
                <Input
                  placeholder="Например: Алексей"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setLoginError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                  className="text-center"
                />
                {loginError && <p className="text-sm text-red-600 mt-2">{loginError}</p>}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Выбери аватар</label>
                <div className="grid grid-cols-4 gap-2">
                  {STARTER_AVATARS.map(avatar => (
                    <button
                      key={avatar}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`text-4xl p-3 rounded-lg border-2 transition-all hover:scale-110 ${
                        selectedAvatar === avatar 
                          ? 'border-purple-500 bg-purple-50 scale-110' 
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                onClick={handleRegister}
              >
                Начать обучение
              </Button>

              <Button 
                variant="ghost"
                className="w-full"
                onClick={() => setScreen('login')}
              >
                Уже есть аккаунт? Войти
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="font-medium mb-2">🎁 Стартовые бонусы:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 200 монет на старте</li>
                  <li>• Доступ ко всем категориям</li>
                  <li>• Система достижений (17 наград)</li>
                  <li>• Магазин с усилениями</li>
                  <li>• Ежедневные бонусы</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm p-8">
          <div className="text-center mb-6">
            <div className="inline-block bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-4 mb-4 animate-bounce">
              <Coins className="w-16 h-16 text-white" />
            </div>
            <h1 className="mb-2">ФинансыPRO</h1>
            <p className="text-muted-foreground">Образовательная игра по финансовой грамотности</p>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-12"
              onClick={() => setScreen('register')}
            >
              <Crown className="w-5 h-5 mr-2" />
              Создать аккаунт
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 text-center border border-blue-200">
                <p className="text-2xl mb-1">32+</p>
                <p className="text-xs text-muted-foreground">Вопросов</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 text-center border border-green-200">
                <p className="text-2xl mb-1">17</p>
                <p className="text-xs text-muted-foreground">Достижений</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 text-center border border-purple-200">
                <p className="text-2xl mb-1">6</p>
                <p className="text-xs text-muted-foreground">Тем</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-3 text-center border border-yellow-200">
                <p className="text-2xl mb-1">10+</p>
                <p className="text-xs text-muted-foreground">Аватаров</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-lg p-4 text-sm text-center">
              <p className="font-medium mb-1">🎉 Получи 200 монет при регистрации!</p>
              <p className="text-xs text-muted-foreground">+ Ежедневные бонусы и награды</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const currentTheme = THEMES[stats.theme as keyof typeof THEMES] || THEMES.default;
  const xpToNextLevel = (stats.level * 100) - stats.xp;
  const xpProgress = ((stats.xp % 100) / 100) * 100;

  // Активные усиления
  const activeDoubleCoins = stats.powerUps.filter(p => 
    p.type === 'double-coins' && p.expiresAt && p.expiresAt > Date.now()
  ).length > 0;
  const activeXpBoost = stats.powerUps.filter(p => 
    p.type === 'xp-boost' && p.expiresAt && p.expiresAt > Date.now()
  ).length > 0;

  // Домашний экран
  if (screen === 'home') {
    const dailyTasks = [
      { id: 'quiz', name: 'Пройди 1 квиз', reward: 25, completed: stats.dailyTasksCompleted?.includes('quiz') || false, icon: '📝' },
      { id: 'budget', name: 'Используй симулятор', reward: 25, completed: stats.dailyTasksCompleted?.includes('budget') || false, icon: '💰' },
      { id: 'perfect', name: 'Получи 100%', reward: 25, completed: stats.dailyTasksCompleted?.includes('perfect') || false, icon: '⭐' },
    ];

    return (
      <div className={`min-h-screen bg-gradient-to-b ${currentTheme.primary} relative`}>
        {/* Анимация монет */}
        {showCoinAnimation && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="text-6xl font-bold text-yellow-400 animate-bounce drop-shadow-lg">
              +{coinAmount} 🪙
            </div>
          </div>
        )}

        <div className="mx-auto max-w-md min-h-screen p-6 space-y-4 pb-24">
          {/* Профиль */}
          <Card className="bg-white/95 backdrop-blur-sm p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-4xl">{stats.avatar}</div>
              <div className="flex-1">
                <h2 className="font-medium">{stats.username}</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Уровень {stats.level}</Badge>
                  {activeDoubleCoins && <Badge className="bg-yellow-500 text-xs">🪙 x2</Badge>}
                  {activeXpBoost && <Badge className="bg-purple-500 text-xs">⚡ x1.5</Badge>}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setScreen('profile')}
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-3 text-center border-2 border-yellow-400">
                <Coins className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-yellow-700">{stats.coins}</p>
                <p className="text-xs text-muted-foreground">Монет</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 text-center border-2 border-orange-400">
                <Gift className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-orange-700">{stats.dailyStreak}</p>
                <p className="text-xs text-muted-foreground">Дне 🔥</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>XP: {stats.xp % 100}/100</span>
                <span>{xpToNextLevel} до уровня {stats.level + 1}</span>
              </div>
              <Progress value={xpProgress} className="h-2" />
            </div>
          </Card>

          {/* Ежедневные задания */}
          <Card className="bg-white/95 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Ежедневные задания</h3>
              <Badge variant="outline">{(stats.dailyTasksCompleted || []).length}/3</Badge>
            </div>
            <div className="space-y-2">
              {dailyTasks.map(task => (
                <div 
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    task.completed 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{task.icon}</span>
                    <span className="text-sm font-medium">{task.name}</span>
                  </div>
                  {task.completed ? (
                    <Badge className="bg-green-500">✓ Выполнено</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">+{task.reward} 🪙</Badge>
                  )}
                </div>
              ))}
            </div>
            {(stats.dailyTasksCompleted || []).length === 3 && (
              <div className="mt-3 p-2 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg text-center border border-yellow-300">
                <p className="text-sm font-medium text-yellow-800">🎉 Все задания выполнены!</p>
              </div>
            )}
          </Card>

          {/* Статистика */}
          <div className="grid grid-cols-3 gap-2">
            <Card className="bg-white/95 backdrop-blur-sm p-3 text-center hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
              <p className="text-xl font-bold">{stats.totalQuizzes}</p>
              <p className="text-xs text-muted-foreground">Квизов</p>
            </Card>
            <Card className="bg-white/95 backdrop-blur-sm p-3 text-center hover:scale-105 transition-transform">
              <Star className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xl font-bold">{stats.perfectScores}</p>
              <p className="text-xs text-muted-foreground">Идеально</p>
            </Card>
            <Card className="bg-white/95 backdrop-blur-sm p-3 text-center hover:scale-105 transition-transform">
              <Target className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xl font-bold">{stats.achievements.length}</p>
              <p className="text-xs text-muted-foreground">Награды</p>
            </Card>
          </div>

          {/* Кнопки меню */}
          <div className="space-y-3">
            <Button
              className="w-full h-20 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white justify-start px-6 shadow-lg hover:shadow-xl transition-all"
              onClick={() => setScreen('quiz-select')}
            >
              <div className="flex items-center gap-4">
                <BookOpen className="w-8 h-8" />
                <div className="text-left">
                  <div className="font-bold">Квиз по финансам</div>
                  <div className="text-xs text-white/80">32+ вопросов • 5 категорий</div>
                </div>
              </div>
            </Button>

            <Button
              className="w-full h-20 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white justify-start px-6 shadow-lg hover:shadow-xl transition-all"
              onClick={() => setScreen('budget')}
            >
              <div className="flex items-center gap-4">
                <TrendingUp className="w-8 h-8" />
                <div className="text-left">
                  <div className="font-bold">Симулятор Бюджета</div>
                  <div className="text-xs text-white/80">Правило 50/30/20 • +75 монет</div>
                </div>
              </div>
            </Button>

            <div className="grid grid-cols-3 gap-3">
              <Button
                className="h-16 bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white flex-col shadow-lg"
                onClick={() => setScreen('stats')}
              >
                <Trophy className="w-6 h-6 mb-1" />
                <span className="text-xs">Награды</span>
              </Button>
              <Button
                className="h-16 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex-col shadow-lg"
                onClick={() => setScreen('shop')}
              >
                <ShoppingBag className="w-6 h-6 mb-1" />
                <span className="text-xs">Магазин</span>
              </Button>
              <Button
                className="h-16 bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white flex-col shadow-lg"
                onClick={() => setScreen('history')}
              >
                <BookOpen className="w-6 h-6 mb-1" />
                <span className="text-xs">История</span>
              </Button>
            </div>
          </div>

          {/* Совет дня */}
          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400 p-4">
            <p className="text-sm font-medium mb-1 flex items-center gap-2">
              💡 Совет дня
            </p>
            <p className="text-xs text-muted-foreground">
              {[
                'Откладывай 10% с каждого дохода - это привычка богатых людей!',
                'Инвестируй в свое образование - это лучшая инвестиция!',
                'Не храни все деньги в одном месте - диверсифицируй!',
                'Следи за мелкими расходами - ��ни складываются в большие суммы!',
                'Установи финансовые цели на год и следуй им!',
                'Начни инвестировать рано - время твой лучший союзник!',
                'Правило 50/30/20 поможет сбалансировать твой бюджет!'
              ][new Date().getDay()]}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Остальные экраны
  const screenContent = () => {
    switch (screen) {
      case 'quiz-select':
        return <QuizSelect />;
      case 'quiz':
        return (
          <Quiz 
            category={selectedCategory} 
            onComplete={handleQuizComplete} 
            onBack={() => setScreen('quiz-select')}
            powerUps={stats.powerUps}
            onUsePowerUp={(type) => {
              setStats(prev => {
                if (!prev) return null;
                const index = prev.powerUps.findIndex(p => p.type === type && (!p.expiresAt || p.expiresAt > Date.now()));
                if (index === -1) return prev;
                const newPowerUps = [...prev.powerUps];
                newPowerUps.splice(index, 1);
                return { ...prev, powerUps: newPowerUps };
              });
            }}
          />
        );
      case 'budget':
        return (
          <>
            <div className="bg-white/10 backdrop-blur-sm p-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setScreen('home')}>
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </div>
            <BudgetSimulator onComplete={handleBudgetComplete} />
          </>
        );
      case 'stats':
        return <StatsScreen />;
      case 'shop':
        return (
          <Shop 
            stats={stats} 
            onPurchase={handlePurchase}
            onPowerUpPurchase={handlePowerUpPurchase}
            onThemeChange={handleThemeChange} 
            onAvatarChange={handleAvatarChange} 
            onBack={() => setScreen('home')} 
          />
        );
      case 'profile':
        return <ProfileScreen />;
      case 'history':
        return <HistoryScreen />;
      default:
        return null;
    }
  };

  function QuizSelect() {
    const categories = [
      { id: 'mixed' as QuizCategory, name: 'Все темы', icon: '🎲', desc: '10 случайных вопросов', color: 'from-purple-500 to-pink-500' },
      { id: 'basics' as QuizCategory, name: 'Основы финансов', icon: '💰', desc: '8 вопросов о базе', color: 'from-blue-500 to-cyan-500' },
      { id: 'saving' as QuizCategory, name: 'Сбережения', icon: '🏦', desc: '8 вопросов о накоплениях', color: 'from-green-500 to-emerald-500' },
      { id: 'budget' as QuizCategory, name: 'Бюджет', icon: '📊', desc: '8 вопросов о планировании', color: 'from-orange-500 to-red-500' },
      { id: 'investing' as QuizCategory, name: 'Инвестиции', icon: '📈', desc: '9 вопросов об инвестировании', color: 'from-yellow-500 to-amber-500' },
    ];

    return (
      <>
        <div className="bg-white/10 backdrop-blur-sm p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setScreen('home')}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h2 className="text-white">Выбери категорию</h2>
              <p className="text-white/80 text-sm">Каждая категория - новые знания</p>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {categories.map(cat => {
            const catStats = stats!.categoryScores[cat.id];
            return (
              <Card key={cat.id} className="p-4 bg-white/95 backdrop-blur-sm cursor-pointer hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl"
                onClick={() => { setSelectedCategory(cat.id); setScreen('quiz'); }}>
                <div className="flex items-start gap-4">
                  <div className={`text-4xl p-3 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg`}>
                    <span className="text-3xl">{cat.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{cat.desc}</p>
                    {catStats.played > 0 ? (
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">Пройдено: {catStats.played}</Badge>
                        <Badge variant="outline" className="text-xs">Средний: {catStats.avgScore.toFixed(0)}%</Badge>
                      </div>
                    ) : (
                      <Badge className="bg-blue-500 text-xs">Новая категория!</Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </>
    );
  }

  function StatsScreen() {
    const achievementsList = [
      { id: 'first-quiz', name: 'Первый шаг', desc: 'П��ойди первый квиз', icon: '🎯', reward: 100 },
      { id: 'quiz-expert', name: 'Эксперт', desc: 'Пройди 10 квизов', icon: '🏆', reward: 100 },
      { id: 'quiz-master', name: 'Мастер', desc: 'Пройди 50 квизов', icon: '👑', reward: 100 },
      { id: 'quiz-legend', name: 'Легенда', desc: 'Пройди 100 квизов', icon: '🔥', reward: 100 },
      { id: 'perfectionist', name: 'Перфекционист', desc: '5 идеальных результатов', icon: '⭐', reward: 100 },
      { id: 'perfect-10', name: 'Безупречный', desc: '10 идеальных', icon: '✨', reward: 100 },
      { id: 'perfect-25', name: 'Идеальный', desc: '25 идеальных', icon: '💫', reward: 100 },
      { id: 'rich', name: 'Богач', desc: 'Заработай 500 монет', icon: '💰', reward: 100 },
      { id: 'millionaire', name: 'Миллионер', desc: 'Заработай 1000 монет', icon: '💎', reward: 100 },
      { id: 'mega-rich', name: 'Мега-богач', desc: 'Заработай 2000 монет', icon: '👑', reward: 100 },
      { id: 'billionaire', name: 'Миллиардер', desc: 'Заработай 5000 монет', icon: '🏆', reward: 100 },
      { id: 'level-5', name: 'Мастер 5', desc: 'Достигни 5 уровня', icon: '🌟', reward: 100 },
      { id: 'level-10', name: 'Легенда 10', desc: 'Достигни 10 уовня', icon: '🔥', reward: 100 },
      { id: 'level-20', name: 'Титан 20', desc: 'Достигни 20 уровня', icon: '⚡', reward: 100 },
      { id: 'streak-7', name: 'Неделя', desc: '7 дней подряд', icon: '📅', reward: 100 },
      { id: 'streak-30', name: 'Месяц', desc: '30 дней подряд', icon: '📆', reward: 100 },
      { id: 'streak-100', name: '100 дней', desc: '100 дней подряд', icon: '🎊', reward: 100 },
    ];

    return (
      <>
        <div className="bg-white/10 backdrop-blur-sm p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setScreen('home')}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h2 className="text-white">Достижения</h2>
              <p className="text-white/80 text-sm">{stats!.achievements.length}/{achievementsList.length} разблокировано</p>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <Card className="bg-white/95 backdrop-blur-sm p-4">
            <h3 className="text-sm font-medium mb-3">Общая статистика</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <p className="text-2xl font-bold mb-1">{stats!.totalQuizzes}</p>
                <p className="text-xs text-muted-foreground">Всего квизов</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <p className="text-2xl font-bold mb-1">{stats!.perfectScores}</p>
                <p className="text-xs text-muted-foreground">Идеальных</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <p className="text-2xl font-bold mb-1">{stats!.level}</p>
                <p className="text-xs text-muted-foreground">Уровень</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                <p className="text-2xl font-bold mb-1">{stats!.totalCoinsEarned}</p>
                <p className="text-xs text-muted-foreground">Заработано</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm p-4">
            <h3 className="text-sm font-medium mb-3">
              Дотижения ({stats!.achievements.length}/{achievementsList.length})
            </h3>
            <div className="space-y-2">
              {achievementsList.map(achievement => {
                const unlocked = stats!.achievements.includes(achievement.id);
                return (
                  <div key={achievement.id} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    unlocked 
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400' 
                      : 'bg-gray-50 opacity-60 border border-gray-200'
                  }`}>
                    <div className={`text-3xl ${!unlocked && 'grayscale'}`}>{achievement.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground">{achievement.desc}</p>
                    </div>
                    {unlocked ? (
                      <Badge className="bg-green-500">✓</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">+{achievement.reward} 🪙</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </>
    );
  }

  function ProfileScreen() {
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState(stats!.username);

    return (
      <>
        <div className="bg-white/10 backdrop-blur-sm p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setScreen('home')}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h2 className="text-white">Профиль</h2>
              <p className="text-white/80 text-sm">Настройки аккаунта</p>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <Card className="bg-white/95 backdrop-blur-sm p-6 text-center">
            <div className="text-6xl mb-4">{stats!.avatar}</div>
            {editingName ? (
              <div className="space-y-2">
                <Input 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="text-center"
                />
                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      handleUsernameChange(newName);
                      setEditingName(false);
                    }}
                  >
                    Сохранить
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setNewName(stats!.username);
                      setEditingName(false);
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="mb-1">{stats!.username}</h2>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingName(true)}
                >
                  Изменить имя
                </Button>
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Уровень</p>
                <p className="text-2xl font-bold">{stats!.level}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">М��неты</p>
                <p className="text-2xl font-bold">{stats!.coins}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm p-4">
            <h3 className="text-sm font-medium mb-3">Финансовая статистика</h3>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-green-50 rounded border border-green-200">
                <span className="text-sm">Всего заработано</span>
                <span className="font-medium text-green-700">+{stats!.totalCoinsEarned} 🪙</span>
              </div>
              <div className="flex justify-between p-2 bg-red-50 rounded border border-red-200">
                <span className="text-sm">Всего потрачено</span>
                <span className="font-medium text-red-700">-{stats!.totalCoinsSpent} 🪙</span>
              </div>
              <div className="flex justify-between p-2 bg-blue-50 rounded border border-blue-200">
                <span className="text-sm">Баланс</span>
                <span className="font-medium text-blue-700">{stats!.coins} 🪙</span>
              </div>
            </div>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm p-4">
            <h3 className="text-sm font-medium mb-3">Активные усиления</h3>
            {stats!.powerUps.filter(p => !p.expiresAt || p.expiresAt > Date.now()).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Нет активных усилений</p>
            ) : (
              <div className="space-y-2">
                {stats!.powerUps.filter(p => !p.expiresAt || p.expiresAt > Date.now()).map((powerUp, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-purple-50 rounded border border-purple-200">
                    <span className="text-sm">{getPowerUpName(powerUp.type)}</span>
                    {powerUp.expiresAt && (
                      <Badge variant="outline" className="text-xs">
                        {Math.ceil((powerUp.expiresAt - Date.now()) / (1000 * 60 * 60))}ч
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </>
    );
  }

  function HistoryScreen() {
    return (
      <>
        <div className="bg-white/10 backdrop-blur-sm p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setScreen('home')}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h2 className="text-white">История квизов</h2>
              <p className="text-white/80 text-sm">Последние 20 результатов</p>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {stats!.quizHistory.length === 0 ? (
            <Card className="bg-white/95 backdrop-blur-sm p-8 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">Пока нет пройденных квизов</p>
              <Button 
                className="mt-4"
                onClick={() => setScreen('quiz-select')}
              >
                Пройти первый квиз
              </Button>
            </Card>
          ) : (
            stats!.quizHistory.map(quiz => {
              const percentage = (quiz.score / quiz.total) * 100;
              const categoryNames: Record<string, string> = {
                basics: 'Основы',
                saving: 'Сбережения',
                budget: 'Бюджет',
                investing: 'Инвестиции',
                mixed: 'Смешанная'
              };
              
              return (
                <Card key={quiz.id} className="bg-white/95 backdrop-blur-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{categoryNames[quiz.category]}</h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(quiz.date).toLocaleDateString('ru-RU', { 
                          day: 'numeric', 
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Badge className={
                      percentage === 100 ? 'bg-green-500' :
                      percentage >= 80 ? 'bg-blue-500' :
                      percentage >= 60 ? 'bg-yellow-500' : 'bg-gray-500'
                    }>
                      {quiz.score}/{quiz.total}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            percentage === 100 ? 'bg-green-500' :
                            percentage >= 80 ? 'bg-blue-500' :
                            percentage >= 60 ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 flex items-center gap-1 text-sm font-medium text-yellow-700">
                      <Coins className="w-4 h-4" />
                      +{quiz.coinsEarned}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${currentTheme.primary}`}>
      <div className="mx-auto max-w-md min-h-screen">
        {screenContent()}
      </div>
      <Toaster />
    </div>
  );
}