'use client';

import React from 'react';
import { Logo } from '@/components/Logo';
import Link from 'next/link';
import { CarTaxiFront, Users, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-6 font-sans">
      <div className="text-center max-w-xl w-full">
        <div className="mb-6 md:mb-8 flex justify-center">
          <Logo className="w-24 h-24 md:w-32 md:h-32 text-slate-800" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">
          Move-CMD
        </h1>
        <p className="text-slate-500 text-sm md:text-base mb-12">
          Sistema de Gestão de Corridas
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/passageiro" className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-orange-500 hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
            <h2 className="font-bold text-slate-800">Passageiro</h2>
            <p className="text-xs text-slate-500 mt-1">Acessar App</p>
          </Link>
          
          <Link href="/motorista" className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-blue-500 hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <CarTaxiFront size={24} />
            </div>
            <h2 className="font-bold text-slate-800">Motorista</h2>
            <p className="text-xs text-slate-500 mt-1">Painel do Parceiro</p>
          </Link>

          <Link href="/admin" className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-500 hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ShieldCheck size={24} />
            </div>
            <h2 className="font-bold text-slate-800">Admin</h2>
            <p className="text-xs text-slate-500 mt-1">Gestão da Plataforma</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
