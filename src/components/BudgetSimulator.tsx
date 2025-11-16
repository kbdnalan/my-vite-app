import { useState } from 'react';
import { Plus, Minus, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';

interface BudgetSimulatorProps {
  onComplete: () => void;
}

interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  category: 'need' | 'want';
  icon: string;
}

export function BudgetSimulator({ onComplete }: BudgetSimulatorProps) {
  const [monthlyIncome, setMonthlyIncome] = useState(50000);
  const [expenses, setExpenses] = useState<BudgetItem[]>([
    { id: '1', name: 'Аренда жилья', amount: 20000, category: 'need', icon: '🏠' },
    { id: '2', name: 'Продукты', amount: 10000, category: 'need', icon: '🛒' },
    { id: '3', name: 'Транспорт', amount: 3000, category: 'need', icon: '🚌' },
    { id: '4', name: 'Коммуналка', amount: 5000, category: 'need', icon: '💡' },
    { id: '5', name: 'Развлечения', amount: 5000, category: 'want', icon: '🎮' },
    { id: '6', name: 'Рестораны', amount: 4000, category: 'want', icon: '🍕' },
    { id: '7', name: 'Одежда', amount: 3000, category: 'want', icon: '👕' },
  ]);

  // Расчеты
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalNeeds = expenses.filter(e => e.category === 'need').reduce((sum, exp) => sum + exp.amount, 0);
  const totalWants = expenses.filter(e => e.category === 'want').reduce((sum, exp) => sum + exp.amount, 0);
  const savings = monthlyIncome - totalExpenses;
  const savingsPercent = (savings / monthlyIncome) * 100;
  const needsPercent = (totalNeeds / monthlyIncome) * 100;
  const wantsPercent = (totalWants / monthlyIncome) * 100;

  const updateExpense = (id: string, amount: number) => {
    setExpenses(prev => prev.map(exp => 
      exp.id === id ? { ...exp, amount: Math.max(0, amount) } : exp
    ));
  };

  const getFinancialHealth = () => {
    if (savings < 0) return { status: 'Дефицит!', color: 'text-red-600', bg: 'bg-red-100' };
    if (savingsPercent < 10) return { status: 'Нужно больше копить', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (savingsPercent < 20) return { status: 'Хорошо!', color: 'text-blue-600', bg: 'bg-blue-100' };
    return { status: 'Отлично!', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const health = getFinancialHealth();

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Заголовок */}
      <div className="text-white mb-4">
        <h2>Симулятор Бюджета</h2>
        <p className="text-sm text-white/80">Настрой свой бюджет</p>
      </div>

      {/* Доход */}
      <Card className="bg-white/95 backdrop-blur-sm p-4">
        <label className="text-sm mb-2 block">
          Месячный доход: {monthlyIncome.toLocaleString('ru-RU')} ₽
        </label>
        <Slider 
          value={[monthlyIncome]} 
          onValueChange={([value]) => setMonthlyIncome(value)}
          min={20000}
          max={200000}
          step={5000}
        />
      </Card>

      {/* Финансовое здоровье */}
      <Card className={`${health.bg} p-4`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {savings >= 0 ? (
              <TrendingUp className={`w-5 h-5 ${health.color}`} />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
            <span className={health.color}>{health.status}</span>
          </div>
          <Badge variant={savings >= 0 ? "default" : "destructive"}>
            {savings >= 0 ? '+' : ''}{savings.toLocaleString('ru-RU')} ₽
          </Badge>
        </div>
        
        {savings < 0 && (
          <div className="flex items-start gap-2 mt-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>Расходы превышают доходы! Сократи траты</p>
          </div>
        )}

        {savingsPercent >= 20 && (
          <p className="text-sm text-green-700 mt-2">
            🎉 Ты откладываешь {savingsPercent.toFixed(0)}%!
          </p>
        )}
      </Card>

      {/* Распределение бюджета */}
      <Card className="bg-white/95 backdrop-blur-sm p-4">
        <h3 className="text-sm mb-3">Правило 50/30/20</h3>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Нужды: {needsPercent.toFixed(0)}%</span>
              <span className="text-muted-foreground">~50%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500"
                style={{ width: `${Math.min(needsPercent, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Желания: {wantsPercent.toFixed(0)}%</span>
              <span className="text-muted-foreground">~30%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500"
                style={{ width: `${Math.min(wantsPercent, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Сбережения: {savingsPercent.toFixed(0)}%</span>
              <span className="text-muted-foreground">~20%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${savings >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(Math.abs(savingsPercent), 100)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Расходы - Нужды */}
      <Card className="bg-white/95 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm">Нужды</h3>
          <Badge variant="secondary">{totalNeeds.toLocaleString('ru-RU')} ₽</Badge>
        </div>
        <div className="space-y-2">
          {expenses.filter(e => e.category === 'need').map(expense => (
            <div key={expense.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
              <span className="text-2xl">{expense.icon}</span>
              <div className="flex-1">
                <p className="text-sm">{expense.name}</p>
                <p className="text-xs text-muted-foreground">{expense.amount.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => updateExpense(expense.id, expense.amount - 500)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => updateExpense(expense.id, expense.amount + 500)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Расходы - Желания */}
      <Card className="bg-white/95 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm">Желания</h3>
          <Badge variant="secondary">{totalWants.toLocaleString('ru-RU')} ₽</Badge>
        </div>
        <div className="space-y-2">
          {expenses.filter(e => e.category === 'want').map(expense => (
            <div key={expense.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
              <span className="text-2xl">{expense.icon}</span>
              <div className="flex-1">
                <p className="text-sm">{expense.name}</p>
                <p className="text-xs text-muted-foreground">{expense.amount.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => updateExpense(expense.id, expense.amount - 500)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => updateExpense(expense.id, expense.amount + 500)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Кнопка завершения */}
      {savings >= monthlyIncome * 0.15 && (
        <Button
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          onClick={onComplete}
        >
          Завершить (+50 монет)
        </Button>
      )}
    </div>
  );
}
