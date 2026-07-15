'use client';

import React, { useState } from 'react';
import { AppProvider, useAppStore } from '@/lib/StoreProvider';
import AdminDashboard from '@/components/AdminDashboard';
import { LoginForm } from '@/components/LoginForm';
import { ShieldCheck, Users, CarTaxiFront, Wallet } from 'lucide-react';

function AdminContent() {
  const { currentUser, loading } = useAppStore();

  if (loading) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-screen bg-slate-50 font-sans">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Carregando...</p>
      </div>
    );
  }

  if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'operator')) {
    return (
      <div className="flex h-screen bg-slate-100">
        <AdminDashboard onLogout={async () => {
          const { signOut } = await import('firebase/auth');
          const { auth } = await import('@/lib/firebase');
          await signOut(auth);
        }} />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">

      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-slate-300/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-slate-400/20 blur-3xl" />
    </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl">

        {/* Desktop */}
        <section className="hidden w-1/2 flex-col justify-center px-16 lg:flex">

          <div className="mb-10 flex items-center gap-4">

            <div className="rounded-2xl bg-slate-900 p-4 text-white shadow-lg">
              <ShieldCheck size={34} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Painel Administrativo
              </h1>

              <p className="text-slate-500">
                Plataforma de Gestão
              </p>
            </div>

          </div>

          <h2 className="max-w-lg text-5xl font-bold leading-tight text-slate-800">
            Controle completo da sua operação.
          </h2>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
            Gerencie usuários, motoristas, viagens e pagamentos
            através de um painel moderno, rápido e seguro.
          </p>

          <div className="mt-12 space-y-6">

            <Feature
              icon={<Users size={22} />}
              title="Usuários"
              text="Gerenciamento completo."
            />

            <Feature
              icon={<CarTaxiFront size={22} />}
              title="Viagens"
              text="Monitoramento em tempo real."
            />

            <Feature
              icon={<Wallet size={22} />}
              title="Financeiro"
              text="Pagamentos e relatórios."
            />

          </div>

        </section>

        {/* Login */}
        <section className="flex flex-1 items-center justify-center px-6 py-10">

          <div
            className="
              w-full
              max-w-md
              rounded-3xl
              border
              border-white/50
              bg-white/70
              p-8
              shadow-2xl
              backdrop-blur-xl
            "
          >

            <div className="mb-8 text-center">

              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 text-white shadow-lg">
                <ShieldCheck size={36} />
              </div>

              <h2 className="text-3xl font-bold text-slate-900">
                Bem-vindo
              </h2>

              <p className="mt-2 text-slate-500">
                Faça login para acessar o painel.
              </p>

            </div>

            <LoginForm
              type="admin"
              onLogin={() => {}}
            />

          </div>

        </section>

      </div>

    </main>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4">

      <div className="rounded-xl bg-white p-3 shadow">
        {icon}
      </div>

      <div>

        <h3 className="font-semibold text-slate-800">
          {title}
        </h3>

        <p className="text-slate-500">
          {text}
        </p>

      </div>

    </div>
  );
}

export default function AdminPage() {
  return (
    <AppProvider>
      <AdminContent />
    </AppProvider>
  );
}
