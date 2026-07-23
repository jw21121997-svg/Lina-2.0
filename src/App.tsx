import React, { useState } from 'react';
import { AppProvider, useAppStore } from './store/useAppStore';
import { AuthScreen } from './components/auth/AuthScreen';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { WakeWordListener } from './components/common/WakeWordListener';

import { ChatContainer } from './components/chat/ChatContainer';
import { DashboardModule } from './components/modules/DashboardModule';
import { ShoppingModule } from './components/modules/ShoppingModule';
import { BudgetModule } from './components/modules/BudgetModule';
import { CalendarModule } from './components/modules/CalendarModule';
import { RemindersModule } from './components/modules/RemindersModule';
import { ChoresModule } from './components/modules/ChoresModule';
import { PantryModule } from './components/modules/PantryModule';
import { NotesModule } from './components/modules/NotesModule';
import { DriveModule } from './components/modules/DriveModule';
import { MealPlannerModule } from './components/modules/MealPlannerModule';
import { BillsModule } from './components/modules/BillsModule';
import { MaintenanceModule } from './components/modules/MaintenanceModule';
import { PetCareModule } from './components/modules/PetCareModule';
import { WishlistModule } from './components/modules/WishlistModule';
import { EmergencyModule } from './components/modules/EmergencyModule';
import { FamilyRoomModule } from './components/modules/FamilyRoomModule';

function MainAppContent() {
  const { activeModule, isLoggedIn } = useAppStore();
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  if (!isLoggedIn) {
    return <AuthScreen />;
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'chat':
        return <ChatContainer />;
      case 'dashboard':
        return <DashboardModule />;
      case 'shopping':
        return <ShoppingModule />;
      case 'budget':
        return <BudgetModule />;
      case 'calendar':
        return <CalendarModule />;
      case 'reminders':
        return <RemindersModule />;
      case 'chores':
        return <ChoresModule />;
      case 'pantry':
        return <PantryModule />;
      case 'notes':
        return <NotesModule />;
      case 'drive':
        return <DriveModule />;
      case 'meals':
        return <MealPlannerModule />;
      case 'bills':
        return <BillsModule />;
      case 'maintenance':
        return <MaintenanceModule />;
      case 'petcare':
        return <PetCareModule />;
      case 'wishlist':
        return <WishlistModule />;
      case 'emergency':
        return <EmergencyModule />;
      case 'familyroom':
        return <FamilyRoomModule />;
      default:
        return <ChatContainer />;
    }
  };

  return (
    <div className="h-screen h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-violet-500 selection:text-white overflow-hidden">
      <Header onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)} />

      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpenMobile} onCloseMobile={() => setIsSidebarOpenMobile(false)} />

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpenMobile && (
          <div
            onClick={() => setIsSidebarOpenMobile(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 md:hidden"
          />
        )}

        <main className="flex-1 flex flex-col min-w-0 h-full min-h-0 overflow-hidden pb-16 md:pb-0">
          {renderActiveModule()}
        </main>
      </div>

      <WakeWordListener />
      <MobileNav />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
