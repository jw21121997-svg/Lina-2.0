import React from 'react';
import { MessageSquare, LayoutDashboard, ShoppingCart, Award, Users } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ModuleId } from '../../types';

export const MobileNav: React.FC = () => {
  const { activeModule, setActiveModule } = useAppStore();

  const navItems: { id: ModuleId; label: string; icon: any }[] = [
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'dashboard', label: 'Digest', icon: LayoutDashboard },
    { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
    { id: 'chores', label: 'Chores', icon: Award },
    { id: 'familyroom', label: 'Family', icon: Users },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-xl px-4 py-2 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeModule === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-violet-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
