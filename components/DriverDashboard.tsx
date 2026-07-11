'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/StoreProvider';
import { MapPin, Users, Navigation, CheckCircle, XCircle, TrendingUp, Clock, Navigation2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Chat from './Chat';
import dynamic from 'next/dynamic';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_DATA = [
  { name: 'Seg', earnings: 120 },
  { name: 'Ter', earnings: 200 },
  { name: 'Qua', earnings: 150 },
  { name: 'Qui', earnings: 300 },
  { name: 'Sex', earnings: 400 },
  { name: 'Sáb', earnings: 450 },
  { name: 'Dom', earnings: 100 },
];

export default function DriverDashboard() {
  const { currentUser, rides, users, updateRideStatus, loading } = useAppStore();
    
  

  
  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'earnings'>('requests');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);  const [rejectedRides, setRejectedRides] = useState<string[]>([]);
  const pendingRides = rides.filter(r => r.status === 'pending' && !rejectedRides.includes(r.id));
  const activeRide = rides.find(r => currentUser && r.driverId === currentUser.id && (r.status === 'accepted' || r.status === 'in_progress'));
  const completedRides = rides.filter(r => currentUser && r.driverId === currentUser.id && r.status === 'completed');
  
  const prevPendingCountRef = useRef(pendingRides.length);

  useEffect(() => {
    if (pendingRides.length > prevPendingCountRef.current) {
      // Toca um sinal sonoro simples via Web Audio API
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          // Som de "notificação" (dois tons curtos)
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
          
          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
          gainNode.gain.setValueAtTime(0.5, ctx.currentTime + 0.15);
          gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.35);
        }
      } catch (e) {
        console.error("Audio playback failed", e);
      }
    }
    prevPendingCountRef.current = pendingRides.length;
  }, [pendingRides.length]);

  if (loading) return (
    <div className="p-8 text-center flex flex-col items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium">Carregando dados do motorista...</p>
    </div>
  );

  if (!currentUser) return (
    <div className="p-8 text-center bg-white m-4 rounded-xl shadow-sm border border-red-200 text-red-600">
      Perfil não encontrado.
    </div>
  );

  if (currentUser.active === false) {
    return (
      <div className="p-8 text-center bg-amber-50 m-4 rounded-xl shadow-sm border border-amber-200">
        <h3 className="text-lg font-bold text-amber-900 mb-2">Acesso Restrito</h3>
        <p className="text-slate-600">Sua conta de motorista está pendente de aprovação por um administrador.</p>
        <p className="text-sm text-slate-500 mt-4">Por favor, aguarde a liberação do seu acesso.</p>
      </div>
    );
  }

  const todayEarnings = rides
    .filter(r => r.driverId === currentUser.id && r.status === 'completed')
    .reduce((acc, r) => acc + r.price, 0);

  const handleRequestLocation = () => {
    setLocationLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error("Erro ao obter localização", error);
          alert("Não foi possível obter sua localização. Verifique as permissões do navegador.");
          setLocationLoading(false);
        }
      );
    } else {
      alert("Geolocalização não é suportada neste navegador.");
      setLocationLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto h-full flex flex-col bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#0F172A] text-white p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Motorista</h2>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
            <span className="text-amber-400">★</span> {(currentUser.rating || 5).toFixed(1)} • {(currentUser.ridesCompleted || 0)} viagens
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Ganhos hoje</p>
          <p className="text-xl font-bold text-emerald-400">R$ {(todayEarnings || 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white">
        <button onClick={() => setActiveTab('requests')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 ${activeTab === 'requests' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-400'}`}>
          Solicitações
          {pendingRides.length > 0 && (
            <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px]">
              {pendingRides.length}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab('active')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-wider ${activeTab === 'active' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-400'}`}>
          Viagem Atual
        </button>
        <button onClick={() => setActiveTab('earnings')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-wider ${activeTab === 'earnings' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-400'}`}>
          Rendimentos
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {pendingRides.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">Nenhuma solicitação no momento.</div>
            ) : (
              pendingRides.map(ride => (
                <div key={ride.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      {!ride.shared ? (
                        <div suppressHydrationWarning className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px] uppercase tracking-wider mb-2 border border-indigo-100">
                          <Clock className="w-3.5 h-3.5" />
                          Agendado: {(ride.date && !isNaN(new Date(ride.date).getTime()) ? format(new Date(ride.date), "dd/MM/yy 'às' HH:mm") : '--:--')}
                        </div>
                      ) : (
                        <p suppressHydrationWarning className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                          <Clock className="w-3 h-3" /> {(ride.date && !isNaN(new Date(ride.date).getTime()) ? format(new Date(ride.date), "HH:mm") : '--:--')}
                        </p>
                      )}
                      <h4 className="font-bold text-2xl text-slate-900">R$ {(ride.price || 0).toFixed(2)}</h4>
                      <p className="text-sm font-medium text-slate-600 mt-1 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-slate-400" />
                        {users.find(u => u.id === ride.passengerId)?.name || 'Passageiro'}
                      </p>
                    </div>
                    <span className={`border text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${ride.shared ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                      {ride.shared ? 'Compartilhada' : 'Exclusiva'}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-sm font-bold text-slate-700 flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-orange-500 outline outline-2 outline-white"></div> {ride.from}</div>
                    <div className="text-sm font-bold text-slate-700 flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 outline outline-2 outline-white"></div> {ride.to}</div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja ocultar esta viagem?')) {
                          setRejectedRides(prev => [...prev, ride.id]);
                        }
                      }}
                      className="flex-1 bg-red-100 text-red-600 py-3.5 rounded-xl font-bold hover:bg-red-200 transition-colors shadow-sm border border-red-200 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Recusar
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          await updateRideStatus(ride.id, 'accepted');
                          setActiveTab('active');
                        } catch (error) {
                          console.error(error);
                          alert('Erro ao aceitar viagem. Esta corrida pode já ter sido aceita por outro motorista ou cancelada.');
                        }
                      }}
                      className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Aceitar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'active' && (
          <div>
            {!activeRide ? (
              <div className="text-center text-gray-500 mt-10">Você não tem viagem em andamento.</div>
            ) : (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">A Receber Direto</p>
                    <p className="text-3xl font-bold text-slate-900">R$ {(activeRide.price || 0).toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                    <Navigation className="w-6 h-6" />
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Passageiro</p>
                      <p className="text-sm font-bold text-slate-900">{users.find(u => u.id === activeRide.passengerId)?.name || 'Passageiro'}</p>
                    </div>
                  </div>
                  {!activeRide.shared && activeRide.date && (
                    <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Viagem Agendada Para</p>
                        <p suppressHydrationWarning className="text-sm font-bold text-indigo-900">
                          {!isNaN(new Date(activeRide.date).getTime()) ? format(new Date(activeRide.date), "dd/MM/yy 'às' HH:mm") : '--/--'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative h-32 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center mb-6 px-4">
                  <div className="absolute left-[20px] top-6 bottom-6 w-0.5 bg-slate-300"></div>
                  <div className="w-full space-y-6 relative z-10 pl-2">
                     <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-orange-600 outline outline-4 outline-white"></div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{activeRide.from}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Partida</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 outline outline-4 outline-white shadow-sm"></div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{activeRide.to}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Destino</p>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleRequestLocation}
                    disabled={locationLoading}
                    className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border transition-colors ${userLocation ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  >
                    <Navigation2 className="w-3.5 h-3.5" />
                    {locationLoading ? 'Localizando...' : userLocation ? 'Localização Ativa' : 'Compartilhar Minha Localização'}
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Comunicação (Ponto)</h4>
                  <Chat rideId={activeRide.id} currentUserId={currentUser.id} />
                </div>

                <div className="pt-2 flex gap-3">
                  {activeRide.status === 'accepted' ? (
                    <>
                      <button 
                        onClick={async () => {
                          try {
                            await updateRideStatus(activeRide.id, 'in_progress');
                          } catch (err) {
                            alert('Erro ao iniciar corrida.');
                          }
                        }}
                        className="flex-1 bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-md"
                      >
                        Iniciar corrida
                      </button>
                      <button 
                        onClick={async () => {
                          if (window.confirm('Tem certeza que deseja sair desta corrida?')) {
                            try {
                              await updateRideStatus(activeRide.id, 'cancelled');
                            } catch (err) {
                              alert('Erro ao cancelar corrida.');
                            }
                          }
                        }}
                        className="flex-1 bg-red-100 text-red-600 py-4 rounded-xl font-bold hover:bg-red-200 transition-colors shadow-sm border border-red-200"
                      >
                        Sair
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={async () => {
                        try {
                          await updateRideStatus(activeRide.id, 'completed');
                        } catch (err) {
                          alert('Erro ao finalizar corrida.');
                        }
                      }}
                      className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md"
                    >
                      Finalizar Viagem
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        )}

        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <div className="bg-orange-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-[10px] font-bold text-orange-300 mb-2 uppercase tracking-wider">Saldo da Semana</h3>
                <p className="text-4xl font-bold mb-3">R$ 1.720,00</p>
                <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> +15% vs semana passada
                </p>
              </div>
              <div className="absolute right-0 top-0 w-32 h-32 bg-orange-600 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-64">
              <h3 className="text-xs font-bold text-slate-900 mb-6 uppercase tracking-wider">Evolução Diária</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CHART_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="earnings" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wider">Viagens de Hoje</h3>
              {completedRides.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Nenhuma viagem finalizada hoje.</p>
              ) : (
                <div className="space-y-3">
                  {completedRides.map(ride => (
                    <div key={ride.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{ride.to}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{ride.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">R$ {ride.price.toFixed(2)}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Concluída</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between shadow-lg">
              <div>
                <h4 className="font-bold text-sm mb-1">Plano Mensal CMD</h4>
                <div className="mt-2 h-1.5 w-full bg-slate-700 rounded-full">
                  <div className="h-1.5 w-2/3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider">20 dias restantes</p>
              </div>
              <span className="bg-orange-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                100% Repasse
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
