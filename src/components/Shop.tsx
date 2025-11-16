import { ArrowLeft, Coins, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface PowerUp {
  type: 'hint' | 'skip' | 'double-coins' | 'xp-boost' | 'streak-save';
  expiresAt?: number;
}

interface ShopProps {
  stats: {
    coins: number;
    purchasedItems: string[];
    theme: string;
    avatar: string;
    powerUps: PowerUp[];
  };
  onPurchase: (itemId: string, cost: number) => void;
  onPowerUpPurchase: (powerUp: PowerUp, cost: number) => void;
  onThemeChange: (theme: string) => void;
  onAvatarChange: (avatar: string) => void;
  onBack: () => void;
}

const THEMES = [
  { id: 'default', name: 'Фиолетовый', color: 'bg-gradient-to-r from-purple-500 to-pink-500', cost: 0 },
  { id: 'ocean', name: 'Океан', color: 'bg-gradient-to-r from-blue-500 to-cyan-500', cost: 100 },
  { id: 'sunset', name: 'Закат', color: 'bg-gradient-to-r from-orange-500 to-red-500', cost: 100 },
  { id: 'forest', name: 'Лес', color: 'bg-gradient-to-r from-green-500 to-emerald-500', cost: 100 },
  { id: 'gold', name: 'Золото', color: 'bg-gradient-to-r from-yellow-500 to-amber-500', cost: 150 },
  { id: 'night', name: 'Ночь', color: 'bg-gradient-to-r from-indigo-900 to-purple-900', cost: 200 },
];

const AVATARS = [
  { id: 'default', emoji: '👤', name: 'Профиль', cost: 0 },
  { id: 'student', emoji: '👨‍🎓', name: 'Студент', cost: 50 },
  { id: 'business', emoji: '💼', name: 'Бизнесмен', cost: 75 },
  { id: 'star', emoji: '⭐', name: 'Звезда', cost: 100 },
  { id: 'crown', emoji: '👑', name: 'Корона', cost: 150 },
  { id: 'rocket', emoji: '🚀', name: 'Ракета', cost: 100 },
  { id: 'fire', emoji: '🔥', name: 'Огонь', cost: 100 },
  { id: 'diamond', emoji: '💎', name: 'Алмаз', cost: 200 },
  { id: 'trophy', emoji: '🏆', name: 'Трофей', cost: 150 },
  { id: 'brain', emoji: '🧠', name: 'Мозг', cost: 125 },
];

const POWER_UPS = [
  { type: 'hint' as const, name: 'Подсказка', desc: 'Убирает 2 неправильных ответа', icon: '💡', cost: 50 },
  { type: 'skip' as const, name: 'Пропуск вопроса', desc: 'Пропусти сложный вопрос', icon: '⏭️', cost: 75 },
  { type: 'double-coins' as const, name: 'Двойные монеты', desc: 'x2 монет на 24 часа', icon: '🪙', cost: 200 },
  { type: 'xp-boost' as const, name: 'Ускоритель XP', desc: 'x1.5 XP на 24 часа', icon: '⚡', cost: 175 },
  { type: 'streak-save' as const, name: 'Защита серии', desc: 'Спасает от 1 ошибки', icon: '🛡️', cost: 100 },
];

export function Shop({ stats, onPurchase, onPowerUpPurchase, onThemeChange, onAvatarChange, onBack }: ShopProps) {
  const isPurchased = (itemId: string) => (stats.purchasedItems || []).includes(itemId) || itemId === 'default';
  const canAfford = (cost: number) => stats.coins >= cost;

  const handleThemePurchase = (theme: typeof THEMES[0]) => {
    if (theme.cost === 0) {
      onThemeChange(theme.id);
      return;
    }
    
    if (isPurchased(theme.id)) {
      onThemeChange(theme.id);
    } else if (canAfford(theme.cost)) {
      onPurchase(theme.id, theme.cost);
      onThemeChange(theme.id);
    }
  };

  const handleAvatarPurchase = (avatar: typeof AVATARS[0]) => {
    if (avatar.cost === 0) {
      onAvatarChange(avatar.emoji);
      return;
    }
    
    if (isPurchased(avatar.id)) {
      onAvatarChange(avatar.emoji);
    } else if (canAfford(avatar.cost)) {
      onPurchase(avatar.id, avatar.cost);
      onAvatarChange(avatar.emoji);
    }
  };

  const handlePowerUpPurchase = (powerUp: typeof POWER_UPS[0]) => {
    if (!canAfford(powerUp.cost)) return;
    onPowerUpPurchase(powerUp, powerUp.cost);
  };

  const getPowerUpCount = (type: string) => {
    return stats.powerUps.filter(p => p.type === type && (!p.expiresAt || p.expiresAt > Date.now())).length;
  };

  return (
    <>
      <div className="bg-white/10 backdrop-blur-sm p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onBack}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h2 className="text-white">Магазин</h2>
              <p className="text-white/80 text-sm">Потрать монеты на крутые вещи</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-2">
            <Coins className="w-5 h-5 text-yellow-300" />
            <span className="text-white font-medium">{stats.coins}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="themes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="themes">Темы</TabsTrigger>
            <TabsTrigger value="avatars">Аватары</TabsTrigger>
            <TabsTrigger value="powerups">Усиления</TabsTrigger>
          </TabsList>

          {/* Темы */}
          <TabsContent value="themes" className="space-y-3">
            {THEMES.map(theme => {
              const purchased = isPurchased(theme.id);
              const active = stats.theme === theme.id;
              const affordable = canAfford(theme.cost);

              return (
                <Card 
                  key={theme.id}
                  className={`p-4 cursor-pointer transition-all ${
                    active ? 'ring-2 ring-purple-500' : ''
                  } ${!affordable && !purchased ? 'opacity-60' : 'hover:scale-[1.02]'}`}
                  onClick={() => (purchased || affordable) && handleThemePurchase(theme)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl ${theme.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{theme.name}</h3>
                        {active && <Badge className="bg-purple-500">Активна</Badge>}
                        {purchased && !active && <Badge variant="secondary">Куплена</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Меняет цветовую схему приложения
                      </p>
                    </div>
                    <div className="text-right">
                      {theme.cost === 0 ? (
                        <Badge variant="outline">Бесплатно</Badge>
                      ) : purchased ? (
                        <Check className="w-6 h-6 text-green-600" />
                      ) : (
                        <div className="flex items-center gap-1">
                          <Coins className={`w-4 h-4 ${affordable ? 'text-yellow-600' : 'text-gray-400'}`} />
                          <span className={affordable ? '' : 'text-gray-400'}>{theme.cost}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          {/* Аватары */}
          <TabsContent value="avatars" className="grid grid-cols-2 gap-3">
            {AVATARS.map(avatar => {
              const purchased = isPurchased(avatar.id);
              const active = stats.avatar === avatar.emoji;
              const affordable = canAfford(avatar.cost);

              return (
                <Card 
                  key={avatar.id}
                  className={`p-4 cursor-pointer transition-all text-center ${
                    active ? 'ring-2 ring-purple-500' : ''
                  } ${!affordable && !purchased ? 'opacity-60' : 'hover:scale-[1.05]'}`}
                  onClick={() => (purchased || affordable) && handleAvatarPurchase(avatar)}
                >
                  <div className="text-5xl mb-2">{avatar.emoji}</div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">{avatar.name}</h3>
                    {active && <Badge className="bg-purple-500 text-xs">Активен</Badge>}
                    {purchased && !active && <Badge variant="secondary" className="text-xs">Куплен</Badge>}
                    {!purchased && (
                      <div className="flex items-center justify-center gap-1 text-sm">
                        {avatar.cost === 0 ? (
                          <Badge variant="outline" className="text-xs">Бесплатно</Badge>
                        ) : (
                          <>
                            <Coins className={`w-3 h-3 ${affordable ? 'text-yellow-600' : 'text-gray-400'}`} />
                            <span className={affordable ? '' : 'text-gray-400'}>{avatar.cost}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          {/* Усиления */}
          <TabsContent value="powerups" className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <p className="text-sm">
                ℹ️ Усиления расходуемые - используются один раз. Скоро появятся в квизах!
              </p>
            </div>
            {POWER_UPS.map(powerUp => {
              const affordable = canAfford(powerUp.cost);
              const purchasedCount = getPowerUpCount(powerUp.type);

              return (
                <Card 
                  key={powerUp.id}
                  className={`p-4 cursor-pointer transition-all ${
                    !affordable ? 'opacity-60' : 'hover:scale-[1.02]'
                  }`}
                  onClick={() => affordable && handlePowerUpPurchase(powerUp)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl bg-gray-100 rounded-xl p-3">
                      {powerUp.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{powerUp.name}</h3>
                        {purchasedCount > 0 && (
                          <Badge variant="secondary">x{purchasedCount}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{powerUp.desc}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className={`w-4 h-4 ${affordable ? 'text-yellow-600' : 'text-gray-400'}`} />
                      <span className={affordable ? 'font-medium' : 'text-gray-400'}>{powerUp.cost}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}