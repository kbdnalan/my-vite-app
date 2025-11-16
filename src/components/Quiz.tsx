import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Trophy, Coins, ArrowLeft, Lightbulb, SkipForward, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

interface PowerUp {
  type: 'hint' | 'skip' | 'double-coins' | 'xp-boost' | 'streak-save';
  expiresAt?: number;
}

interface QuizProps {
  category: 'basics' | 'saving' | 'budget' | 'investing' | 'mixed';
  onComplete: (score: number, total: number, category: 'basics' | 'saving' | 'budget' | 'investing' | 'mixed', usedPowerUps: string[]) => void;
  onBack: () => void;
  powerUps: PowerUp[];
  onUsePowerUp: (type: string) => void;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const allQuestions = {
  basics: [
    {
      question: 'Что такое активы?',
      correctAnswer: 'То, что приносит вам доход',
      options: ['Деньги, которые нужно отдать', 'То, что приносит вам доход', 'Ежемесячные расходы', 'Налоги и сборы'],
      explanation: 'Активы - это то, что приносит вам доход или имеет ценность. Например, недвижимость, акции, бизнес.'
    },
    {
      question: 'Что такое пассивы?',
      correctAnswer: 'То, что отнимает деньги',
      options: ['То, что приносит доход', 'То, что отнимает деньги', 'Сбережения', 'Инвестиции'],
      explanation: 'Пассивы - это обязательства, которые отнимают у вас деньги. Например, кредиты, долги.'
    },
    {
      question: 'Что означает термин "инфляция"?',
      correctAnswer: 'Рост цен на товары и услуги',
      options: ['Рост цен на товары и услуги', 'Снижение цен', 'Увеличение зарплат', 'Падение доллара'],
      explanation: 'Инфляция - это процесс повышения общего уровня цен, что снижает покупательную способность денег.'
    },
    {
      question: 'Что такое пассивный доход?',
      correctAnswer: 'Доход без активного участия',
      options: ['Зарплата на работе', 'Доход без активного участия', 'Премия за проект', 'Наследство'],
      explanation: 'Пассивный доход - деньги, которые вы получаете регулярно без активной работы (аренда, дивиденды).'
    },
    {
      question: 'Что такое ликвидность?',
      correctAnswer: 'Скорость конвертации в деньги',
      options: ['Прибыльность актива', 'Скорость конвертации в деньги', 'Размер капитала', 'Процентная ставка'],
      explanation: 'Ликвидность - это способность быстро и без потерь конвертировать актив в наличные деньги.'
    },
    {
      question: 'Что такое валовой доход?',
      correctAnswer: 'Доход до вычета налогов и расходов',
      options: ['Доход после налогов', 'Доход до вычета налогов и расходов', 'Только зарплата', 'Пассивный доход'],
      explanation: 'Валовой доход - это весь доход до вычета налогов, страховок и других обязательных платежей.'
    },
    {
      question: 'Что такое кредитный рейтинг?',
      correctAnswer: 'Оценка вашей платежеспособности',
      options: ['Сумма всех кредитов', 'Оценка вашей платежеспособности', 'Процентная ставка', 'Размер зарплаты'],
      explanation: 'Кредитный рейтинг показывает, насколько вы надежны как заемщик для банков.'
    },
    {
      question: 'Что такое чистая прибыль?',
      correctAnswer: 'Доход минус все расходы',
      options: ['Вся прибыль компании', 'Доход минус все расходы', 'Доход до налогов', 'Только зарплата'],
      explanation: 'Чистая прибыль - это то, что остается после вычета всех расходов из дохода.'
    }
  ],
  saving: [
    {
      question: 'Какой процент дохода рекомендуется откладывать?',
      correctAnswer: '20-30%',
      options: ['5-10%', '20-30%', '50%', 'Весь доход'],
      explanation: 'Финансовые эксперты рекомендуют откладывать минимум 20% от дохода на сбережения.'
    },
    {
      question: 'Что такое "подушка безопасности"?',
      correctAnswer: 'Резервный фонд на 3-6 месяцев',
      options: ['Страховка', 'Резервный фонд на 3-6 месяцев', 'Дополнительный доход', 'Кредитная карта'],
      explanation: 'Финансовая подушка - это накопления на 3-6 месяцев жизни без дохода для непредвиденных ситуаций.'
    },
    {
      question: 'Какой лучший способ начать копить?',
      correctAnswer: 'Сразу откладывать при получении дохода',
      options: ['Откладывать остатки', 'Сразу откладывать при получении дохода', 'Не тратить ничего', 'Взять кредит'],
      explanation: 'Правило "Заплати себе первым" - сразу откладывайте нужную сумму при получении дохода.'
    },
    {
      question: 'Где лучше хранить подушку безопасности?',
      correctAnswer: 'На депозите с быстрым доступом',
      options: ['В акциях', 'На депозите с быстрым доступом', 'В криптовалюте', 'Дома под подушкой'],
      explanation: 'Подушку безопасности лучше держать на депозите с возможностью быстрого снятия без потерь.'
    },
    {
      question: 'Что такое автоматические сбережения?',
      correctAnswer: 'Автоперевод % зарплаты на сберсчет',
      options: ['Копилка дома', 'Автоперевод % зарплаты на сберсчет', 'Инвестиции в акции', 'Кэшбэк'],
      explanation: 'Автосбережения - автоматический перевод фиксированной суммы или процента дохода на сберегательный счет.'
    },
    {
      question: 'Сколько нужно экстренного фонда студенту?',
      correctAnswer: '1-2 месяца расходов',
      options: ['1-2 месяца расходов', '3-6 месяцев расходов', '1 год расходов', 'Не нужен'],
      explanation: 'Студенту достаточно фонда на 1-2 месяца, так как расходы обычно ниже и есть поддержка семьи.'
    },
    {
      question: 'Что такое сложный процент?',
      correctAnswer: 'Процент на процент',
      options: ['Высокая ставка', 'Процент на процент', 'Банковская комиссия', 'Налог на доход'],
      explanation: 'Сложный процент - когда проценты начисляются не только на основную сумму, но и на уже начисленные проценты.'
    },
    {
      question: 'Зачем нужна подушка безопасности?',
      correctAnswer: 'Для непредвиденных расходов',
      options: ['Для покупки машины', 'Для непредвиденных расходов', 'Для отпуска', 'Для инвестиций'],
      explanation: 'Подушка безопасности защищает от финансовых проблем при потере работы, болезни или непредвиденных трат.'
    }
  ],
  budget: [
    {
      question: 'Что такое правило 50/30/20?',
      correctAnswer: '50% нужды, 30% желания, 20% сбережения',
      options: [
        '50% развлечения, 30% еда, 20% жилье',
        '50% нужды, 30% желания, 20% сбережения',
        '50% долги, 30% налоги, 20% себе',
        '50% копить, 30% тратить, 20% инвестировать'
      ],
      explanation: 'Правило 50/30/20 - метод бюджетирования: 50% на необходимое, 30% на желания, 20% на сбережения.'
    },
    {
      question: 'Зачем нужен личный бюджет?',
      correctAnswer: 'Контролировать финансы',
      options: ['Контролировать финансы', 'Требование налоговой', 'Чтобы выглядеть умнее', 'Это не нужно'],
      explanation: 'Личный бюджет помогает контролировать финансы, планировать расходы и достигать целей.'
    },
    {
      question: 'Что делать, если расходы превышают доходы?',
      correctAnswer: 'Сократить необязательные расходы',
      options: ['Взять кредит', 'Не обращать внимания', 'Сократить необязательные расходы', 'Перестать вести бюджет'],
      explanation: 'При превышении расходов нужно пересмотреть бюджет и сократить необязательные траты.'
    },
    {
      question: 'Как часто нужно пересматривать бюджет?',
      correctAnswer: 'Каждый месяц',
      options: ['Раз в год', 'Каждый месяц', 'Никогда', 'Раз в 5 лет'],
      explanation: 'Бюджет нужно пересматривать ежемесячно, чтобы корректировать расходы и отслеживать прогресс.'
    },
    {
      question: 'Что относится к постоянным расходам?',
      correctAnswer: 'Аренда жилья',
      options: ['Развлечения', 'Аренда жилья', 'Покупка одежды', 'Путешествия'],
      explanation: 'Постоянные расходы - это регулярные обязательные платежи: аренда, коммуналка, транспорт.'
    },
    {
      question: 'Что такое метод "конвертов"?',
      correctAnswer: 'Распределение наличных по категориям',
      options: [
        'Хранение всех денег в конверте',
        'Распределение наличных по категориям',
        'Отправка денег по почте',
        'Способ получения зарплаты'
      ],
      explanation: 'Метод конвертов - распределение наличных денег по физическим конвертам для разных категорий расходов.'
    },
    {
      question: 'Что такое переменные расходы?',
      correctAnswer: 'Расходы которые меняются каждый месяц',
      options: ['Только развлечения', 'Расходы которые меняются каждый месяц', 'Зарплата', 'Кредиты'],
      explanation: 'Переменные расходы - это траты, которые отличаются от месяца к месяцу (еда, транспорт, развлечения).'
    },
    {
      question: 'Зачем отслеживать мелкие расходы?',
      correctAnswer: 'Они складываются в большие суммы',
      options: ['Не нужно', 'Они складываются в большие суммы', 'Это сложно', 'Только для бизнеса'],
      explanation: 'Мелкие ежедневные траты (кофе, снеки) могут составлять значительную часть бюджета за месяц.'
    }
  ],
  investing: [
    {
      question: 'Что такое диверсификация?',
      correctAnswer: 'Распределение инвестиций между активами',
      options: [
        'Вложение всех денег в одну акцию',
        'Распределение инвестиций между активами',
        'Покупка только недвижимости',
        'Хранение денег дома'
      ],
      explanation: 'Диверсификация - распределение инвестиций между разными активами для снижения рисков.'
    },
    {
      question: 'Что такое дивиденды?',
      correctAnswer: 'Часть прибыли компании акционерам',
      options: ['Налог на прибыль', 'Часть прибыли компании акционерам', 'Комиссия брокера', 'Процент по вкладу'],
      explanation: 'Дивиденды - это часть прибыли компании, которую она распределяет между акционерами.'
    },
    {
      question: 'С какого возраста лучше начинать инвестировать?',
      correctAnswer: 'Как можно раньше',
      options: ['После 40 лет', 'После 30 лет', 'Как можно раньше', 'После выхода на пенсию'],
      explanation: 'Чем раньше начнешь инвестировать, тем больше времени у денег для роста за счет сложного процента.'
    },
    {
      question: 'Что такое волатильность?',
      correctAnswer: 'Изменчивость цены актива',
      options: ['Прибыльность актива', 'Изменчивость цены актива', 'Срок инвестиции', 'Налог на доход'],
      explanation: 'Волатильность - это степень изменчивости цены актива. Высокая волатильность = высокий риск.'
    },
    {
      question: 'Что такое ПИФ?',
      correctAnswer: 'Коллективное инвестирование',
      options: [
        'Банковский вклад',
        'Коллективное инвестирование',
        'Кредитная организация',
        'Страховая компания'
      ],
      explanation: 'ПИФ - это способ коллективного инвестирования, где профессионалы управляют деньгами инвесторов.'
    },
    {
      question: 'Что означает термин "облигация"?',
      correctAnswer: 'Долговая ценная бумага',
      options: ['Акция компании', 'Долговая ценная бумага', 'Валюта', 'Недвижимость'],
      explanation: 'Облигация - долговая ценная бумага, по которой эмитент обязуется вернуть деньги с процентами.'
    },
    {
      question: 'Какой горизонт считается долгосрочным?',
      correctAnswer: '3-5 лет и более',
      options: ['1 месяц', '1 год', '3-5 лет и более', '1 неделя'],
      explanation: 'Долгосрочные инвестиции - это вложения на срок от 3-5 лет и более.'
    },
    {
      question: 'Что такое ETF?',
      correctAnswer: 'Биржевой фонд',
      options: ['Криптовалюта', 'Биржевой фонд', 'Тип акций', 'Банковский продукт'],
      explanation: 'ETF - биржевой фонд, который содержит набор акций или облигаций и торгуется как обычная акция.'
    },
    {
      question: 'Что важнее при инвестировании?',
      correctAnswer: 'Время на рынке',
      options: ['Время входа на рынок', 'Время на рынке', 'Удача', 'Большая сумма'],
      explanation: 'Длительность инвестирования важнее точного момента входа благодаря сложному проценту и усреднению.'
    }
  ]
};

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function Quiz({ category, onComplete, onBack, powerUps, onUsePowerUp }: QuizProps) {
  const [questions, setQuestions] = useState<Array<Question & { shuffledOptions: string[] }>>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [usedPowerUps, setUsedPowerUps] = useState<string[]>([]);
  const [hintUsed, setHintUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [streakSaveUsed, setStreakSaveUsed] = useState(false);

  useEffect(() => {
    let selectedQuestions: typeof allQuestions.basics = [];
    
    if (category === 'mixed') {
      const basics = shuffleArray(allQuestions.basics).slice(0, 3);
      const saving = shuffleArray(allQuestions.saving).slice(0, 3);
      const budget = shuffleArray(allQuestions.budget).slice(0, 2);
      const investing = shuffleArray(allQuestions.investing).slice(0, 2);
      
      selectedQuestions = shuffleArray([...basics, ...saving, ...budget, ...investing]);
    } else {
      selectedQuestions = shuffleArray(allQuestions[category]).slice(0, 10);
    }
    
    const questionsWithShuffledOptions = selectedQuestions.map(q => ({
      ...q,
      shuffledOptions: shuffleArray([...q.options])
    }));
    
    setQuestions(questionsWithShuffledOptions);
  }, [category]);

  if (questions.length === 0) {
    return <div className="p-4 text-white">Загрузка...</div>;
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // Подсчет доступных усилений
  const availableHints = powerUps.filter(p => p.type === 'hint').length;
  const availableSkips = powerUps.filter(p => p.type === 'skip').length;
  const availableStreakSaves = powerUps.filter(p => p.type === 'streak-save').length;

  const handleUseHint = () => {
    if (availableHints === 0 || hintUsed || showExplanation) {
      toast.error('Подсказка недоступна!');
      return;
    }

    const wrongOptions = question.shuffledOptions.filter(opt => opt !== question.correctAnswer);
    const toHide = shuffleArray(wrongOptions).slice(0, 2);
    
    setHiddenOptions(toHide);
    setHintUsed(true);
    onUsePowerUp('hint');
    setUsedPowerUps([...usedPowerUps, 'hint']);
    toast.success('💡 Подсказка использована! Убраны 2 неправильных ответа');
  };

  const handleSkipQuestion = () => {
    if (availableSkips === 0 || showExplanation) {
      toast.error('Пропуск недоступен!');
      return;
    }

    onUsePowerUp('skip');
    setUsedPowerUps([...usedPowerUps, 'skip']);
    toast.success('⏭️ Вопрос пропущен!');
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setHintUsed(false);
      setHiddenOptions([]);
    } else {
      setIsFinished(true);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showExplanation || hiddenOptions.includes(answer)) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === question.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
    } else {
      // Проверка защиты серии
      if (availableStreakSaves > 0 && currentStreak > 0 && !streakSaveUsed) {
        onUsePowerUp('streak-save');
        setUsedPowerUps([...usedPowerUps, 'streak-save']);
        setStreakSaveUsed(true);
        toast.success('🛡️ Защита серии использована! Серия сохранена!');
      } else {
        setCurrentStreak(0);
      }
    }
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setHintUsed(false);
      setHiddenOptions([]);
    } else {
      const finalScore = score + (selectedAnswer === question.correctAnswer ? 1 : 0);
      setScore(finalScore);
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const percentage = (score / questions.length) * 100;
    let coinsEarned = score * 10;
    let xpEarned = score * 5;
    
    if (percentage === 100) {
      coinsEarned += 50;
      xpEarned += 25;
    } else if (percentage >= 80) {
      coinsEarned += 20;
      xpEarned += 10;
    }

    const categoryNames: Record<string, string> = {
      basics: 'Основы финансов',
      saving: 'Сбережения',
      budget: 'Бюджет',
      investing: 'Инвестиции',
      mixed: 'Смешанная'
    };

    return (
      <div className="p-4 flex items-center justify-center min-h-[80vh]">
        <Card className="w-full bg-white/95 backdrop-blur-sm p-6 text-center">
          <div className="inline-block bg-yellow-100 rounded-full p-6 mb-4">
            <Trophy className="w-16 h-16 text-yellow-600" />
          </div>
          <h2 className="mb-2">
            {percentage === 100 ? 'Идеально! 🎉' : percentage >= 80 ? 'Отлично! 👏' : percentage >= 60 ? 'Хорошо! 👍' : 'Попробуй еще! 💪'}
          </h2>
          <p className="text-muted-foreground mb-2">
            Категория: {categoryNames[category]}
          </p>
          
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 mb-4">
            <p className="text-4xl mb-2">{score}/{questions.length}</p>
            <p className="text-sm text-muted-foreground mb-3">Правильных ответов</p>
            <div className="h-2 bg-white rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-white/50 rounded p-2">
                <p className="text-xs text-muted-foreground">Процент</p>
                <p className="font-medium">{percentage.toFixed(0)}%</p>
              </div>
              <div className="bg-white/50 rounded p-2">
                <p className="text-xs text-muted-foreground">Лучшая серия</p>
                <p className="font-medium">{bestStreak} подряд</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-center gap-2 p-3 bg-yellow-50 rounded-lg">
              <Coins className="w-6 h-6 text-yellow-600" />
              <div className="text-left">
                <p className="text-sm font-medium">+{coinsEarned} ₸</p>
                {percentage === 100 && <p className="text-xs text-muted-foreground">Бонус за идеальный результат!</p>}
                {percentage >= 80 && percentage < 100 && <p className="text-xs text-muted-foreground">Бонус за отличный результат!</p>}
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 bg-purple-50 rounded-lg">
              <Trophy className="w-6 h-6 text-purple-600" />
              <div className="text-left">
                <p className="text-sm font-medium">+{xpEarned} XP</p>
                <p className="text-xs text-muted-foreground">Опыт получен</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              onClick={() => onComplete(score, questions.length, category, usedPowerUps)}
            >
              Продолжить
            </Button>
            <Button 
              variant="outline"
              className="w-full"
              onClick={onBack}
            >
              Выбрать другую категорию
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white/10 backdrop-blur-sm p-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white text-sm">Вопрос {currentQuestion + 1}/{questions.length}</h2>
                <p className="text-white/80 text-xs">
                  Правильно: {score} | Серия: {currentStreak} 🔥
                </p>
              </div>
              <div className="flex gap-1">
                {currentStreak >= 3 && <Badge className="bg-orange-500">🔥 x{currentStreak}</Badge>}
              </div>
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-2 mb-3" />
        
        {/* Усиления */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={handleUseHint}
            disabled={availableHints === 0 || hintUsed || showExplanation}
          >
            <Lightbulb className="w-4 h-4 mr-1" />
            Подсказка ({availableHints})
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={handleSkipQuestion}
            disabled={availableSkips === 0 || showExplanation}
          >
            <SkipForward className="w-4 h-4 mr-1" />
            Пропуск ({availableSkips})
          </Button>
          {availableStreakSaves > 0 && (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              disabled
            >
              <Shield className="w-4 h-4 mr-1" />
              Защита ({availableStreakSaves})
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Card className="bg-white/95 backdrop-blur-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="flex-1">{question.question}</h3>
            <Badge variant="outline" className="ml-2">
              {currentQuestion + 1}/{questions.length}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {question.shuffledOptions.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === question.correctAnswer;
              const showResult = showExplanation;
              const isHidden = hiddenOptions.includes(option);

              if (isHidden) {
                return (
                  <div key={index} className="w-full p-4 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 opacity-40">
                    <span className="text-gray-400">Скрыто подсказкой</span>
                  </div>
                );
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showExplanation}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    showResult
                      ? isCorrect
                        ? 'border-green-500 bg-green-50'
                        : isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-white'
                      : isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showResult && isCorrect && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm">
                <strong>💡 Объяснение:</strong> {question.explanation}
              </p>
            </div>
          )}
        </Card>

        {!showExplanation && (
          <Button
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
          >
            Ответить
          </Button>
        )}

        {showExplanation && (
          <Button
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            onClick={handleNext}
          >
            {currentQuestion < questions.length - 1 ? 'Следующий вопрос →' : 'Завершить'}
          </Button>
        )}
      </div>
    </div>
  );
}
