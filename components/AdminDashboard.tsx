'use client';

import React, { useState } from 'react';
import { Trash2, Users, Car, DollarSign, Activity, Settings, LogOut, LayoutDashboard, UserPlus, SlidersHorizontal, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { useAppStore } from '@/lib/StoreProvider';
import dynamic from 'next/dynamic';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import RegistrationForm from './RegistrationForm';

const CHART_DATA = [
  { name: '01/07', rides: 120, revenue: 1200 },
  { name: '02/07', rides: 140, revenue: 1400 },
  { name: '03/07', rides: 110, revenue: 1100 },
  { name: '04/07', rides: 180, revenue: 1800 },
  { name: '05/07', rides: 220, revenue: 2200 },
];

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { rides, users, toggleUserStatus, deleteUser, updateRideStatus } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'control' | 'rides'>('overview');
  const [controlTab, setControlTab] = useState<'passenger' | 'driver' | 'admin' | 'operator'>('passenger');
  
  const completedRides = rides.filter(r => r.status === 'completed').length + 500; // Mocking historic volume
  
  const filteredUsers = users.filter(u => u.role === controlTab);

  return (
    <div className="min-h-screen w-full flex bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0 shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold flex items-center gap-2 text-white">
            <Activity className="w-6 h-6 text-orange-500" /> 
            Move CMD
          </h1>
          <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider">Painel Administrativo Master</p>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Visão Geral
          </button>
          
          <button 
            onClick={() => setActiveTab('registrations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'registrations' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <UserPlus className="w-5 h-5" />
            Criar Contas
          </button>

          <button 
            onClick={() => setActiveTab('control')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'control' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            Controle de Usuários
          </button>
          
          <button 
            onClick={() => setActiveTab('rides')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'rides' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <MapPin className="w-5 h-5" />
            Viagens
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        {activeTab === 'overview' && (
          <div className="max-w-6xl mx-auto space-y-8">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Visão Geral</h2>
              <p className="text-slate-500 mt-1">Acompanhamento e estatísticas do sistema Move CMD.</p>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-500 mb-4">
                    <Users className="w-5 h-5 text-orange-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">Total Passageiros</span>
                  </div>
                  <p className="text-4xl font-bold text-slate-900">1.204</p>
                </div>
                <div className="mt-4">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wider">+12% este mês</span>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-500 mb-4">
                    <Car className="w-5 h-5 text-orange-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">Motoristas Ativos</span>
                  </div>
                  <p className="text-4xl font-bold text-slate-900">45</p>
                </div>
                <div className="mt-4">
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md uppercase tracking-wider">12 online agora</span>
                </div>
              </div>

              <div className="bg-orange-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-orange-300 mb-4">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Receita Mensal (Assinaturas)</span>
                  </div>
                  <p className="text-4xl font-bold">R$ 4.500,00</p>
                </div>
                <div className="absolute right-0 top-0 w-48 h-48 bg-orange-500 rounded-full blur-3xl opacity-30 -mr-16 -mt-16"></div>
              </div>
            </div>

            {/* Charts & Bottom KPIs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Volume de Corridas (Últimos 5 dias)</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CHART_DATA}>
                      <defs>
                        <linearGradient id="colorRidesDesktop" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                        itemStyle={{ color: '#0f172a' }}
                      />
                      <Area type="monotone" dataKey="rides" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorRidesDesktop)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#0F172A] text-white p-6 rounded-2xl shadow-sm flex flex-col justify-center border border-slate-800">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Activity className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h4 className="font-bold text-lg mb-1">Corridas Concluídas</h4>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Total histórico na plataforma</p>
                </div>
                <p className="text-5xl font-bold text-emerald-400">{completedRides}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="max-w-3xl mx-auto">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Criação de Contas</h2>
              <p className="text-slate-500 mt-1">Crie novas contas de Passageiros e Motoristas (Acesso Master).</p>
            </header>
            
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md">
              <RegistrationForm />
            </div>
          </div>
        )}
        {activeTab === 'control' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Controle de Usuários</h2>
              <p className="text-slate-500 mt-1">Ative ou desative o acesso de passageiros e motoristas à plataforma.</p>
            </header>
            
            <div className="flex border-b border-slate-200 mb-6">
              <button 
                onClick={() => setControlTab('passenger')}
                className={`pb-4 px-6 text-sm font-bold tracking-tight transition-colors border-b-2 ${
                  controlTab === 'passenger' 
                    ? 'border-orange-600 text-orange-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Passageiros
              </button>
              <button 
                onClick={() => setControlTab('driver')}
                className={`pb-4 px-6 text-sm font-bold tracking-tight transition-colors border-b-2 ${
                  controlTab === 'driver' 
                    ? 'border-orange-600 text-orange-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Motoristas
              </button>
              <button 
                onClick={() => setControlTab('admin')}
                className={`pb-4 px-6 text-sm font-bold tracking-tight transition-colors border-b-2 ${
                  controlTab === 'admin' 
                    ? 'border-orange-600 text-orange-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Administradores
              </button>
              <button 
                onClick={() => setControlTab('operator')}
                className={`pb-4 px-6 text-sm font-bold tracking-tight transition-colors border-b-2 ${
                  controlTab === 'operator' 
                    ? 'border-orange-600 text-orange-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Operadores
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-bold">Usuário</th>
                    <th className="px-6 py-4 font-bold">Tipo</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full bg-slate-200 object-cover" />
                          <div>
                            <p className="font-bold text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.phone || 'Sem Telefone'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'driver' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role === 'driver' ? 'Motorista' : user.role === 'admin' ? 'Administrador' : user.role === 'operator' ? 'Operador' : 'Passageiro'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {user.active !== false ? (
                            <><CheckCircle className="w-4 h-4 text-emerald-500" /><span className="text-xs font-semibold text-slate-700">Ativo</span></>
                          ) : (
                            <><XCircle className="w-4 h-4 text-red-500" /><span className="text-xs font-semibold text-slate-700">Inativo</span></>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            user.active !== false 
                              ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {user.active !== false ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => {
                            if(window.confirm('Tem certeza que deseja deletar este usuário?')) {
                              deleteUser(user.id).catch(e => alert('Erro ao deletar: ' + e.message));
                            }
                          }}
                          className="ml-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors bg-slate-100 text-slate-600 hover:bg-slate-200"
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'rides' && (
          <div className="max-w-6xl mx-auto space-y-8">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Viagens</h2>
              <p className="text-slate-500 mt-1">Acompanhamento de todas as viagens na plataforma.</p>
            </header>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-bold">Data</th>
                    <th className="px-6 py-4 font-bold">Trajeto</th>
                    <th className="px-6 py-4 font-bold">Passageiro</th>
                    <th className="px-6 py-4 font-bold">Motorista</th>
                    <th className="px-6 py-4 font-bold">Valor</th>
                    <th className="px-6 py-4 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rides.map(ride => {
                    const passenger = users.find(u => u.id === ride.passengerId);
                    const driver = users.find(u => u.id === ride.driverId);
                    return (
                      <tr key={ride.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900 font-medium">{new Date(ride.date).toLocaleDateString('pt-BR')}</div>
                          <div className="text-xs text-slate-500">{new Date(ride.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"><MapPin className="w-3 h-3 text-orange-500"/> {ride.from}</span>
                            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"><MapPin className="w-3 h-3 text-emerald-500"/> {ride.to}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {passenger?.avatar && <img src={passenger.avatar} alt="" className="w-6 h-6 rounded-full" />}
                            <span className="text-sm font-bold text-slate-700">{passenger?.name || 'Desconhecido'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {driver?.avatar ? <img src={driver.avatar} alt="" className="w-6 h-6 rounded-full" /> : <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200"></div>}
                            <span className="text-sm font-bold text-slate-700">{driver?.name || 'Não atribuído'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-emerald-600">R$ {ride.price.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            ride.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            ride.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            ride.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {ride.status === 'pending' ? 'Pendente' :
                             ride.status === 'accepted' ? 'Aceita' :
                             ride.status === 'in_progress' ? 'Em Andamento' :
                             ride.status === 'completed' ? 'Concluída' : 'Cancelada'}
                          </span>
                          {(ride.status === 'pending' || ride.status === 'accepted') && (
                            <button
                              onClick={() => {
                                if(window.confirm('Deseja realmente cancelar esta viagem agendada?')) {
                                  updateRideStatus(ride.id, 'cancelled').catch(e => { console.error(e); alert('Erro ao cancelar corrida.'); });
                                }
                              }}
                              className="text-[10px] font-bold text-red-600 hover:text-red-800 underline uppercase tracking-wider ml-2"
                            >
                              Cancelar
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {rides.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                  Nenhuma viagem registrada no sistema.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
