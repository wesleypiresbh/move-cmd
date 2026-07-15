
'use client';

import React, { useState } from 'react';
import { AppProvider, useAppStore } from '@/lib/StoreProvider';
import PassengerDashboard from '@/components/PassengerDashboard';
import { LogOut } from 'lucide-react';
import { LoginForm } from '@/components/LoginForm';

function AppContent() {
  const { currentUser, loading } = useAppStore();

  if (loading) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-screen bg-slate-50 font-sans">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Carregando...</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'passenger') {
    return (
      <LoginForm 
        type="passageiro" 
        onLogin={() => {}} 
      />
    );
  }

  return (
    <div className="flex-1 overflow-hidden relative flex flex-col">
      <div className="absolute top-4 right-4 z-50">
         <button 
           onClick={async () => {
             const { signOut } = await import('firebase/auth');
             const { auth } = await import('@/lib/firebase');
             await signOut(auth);
           }}
           className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-colors cursor-pointer"
           title="Sair"
         >
           <LogOut className="w-4 h-4" />
         </button>
      </div>

      <PassengerDashboard />
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
        <AppContent />
      </div>
    </AppProvider>
  );
}
