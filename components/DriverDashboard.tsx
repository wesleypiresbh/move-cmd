'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/StoreProvider';
import { MapPin, Users, Navigation, CheckCircle, XCircle, TrendingUp, Clock, Navigation2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Chat from './Chat';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
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
  const { currentUser, rides, users, updateRideStatus, loading, addMessage } = useAppStore();
    
  

  
  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'chat' | 'earnings'>('requests');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [rejectedRides, setRejectedRides] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [expandedRideId, setExpandedRideId] = useState<string | null>(null);

  const activeRides = rides.filter(r => currentUser && r.driverId === currentUser.id && (r.status === 'accepted' || r.status === 'in_progress'));
  const hasActiveExclusive = activeRides.some(r => !r.shared);
  const activeSharedCount = activeRides.filter(r => r.shared).length;
  const isFullyBlocked = hasActiveExclusive || activeSharedCount >= 3;

  const pendingRides = isFullyBlocked ? [] : rides.filter(r => {
    if (r.status !== 'pending' || rejectedRides.includes(r.id)) return false;
    // Se o motorista tem viagens compartilhadas ativas, ele não pode aceitar viagens exclusivas
    if (activeSharedCount > 0 && !r.shared) return false;
    return true;
  });

  const activeRide = activeRides.find(r => r.id === expandedRideId) || activeRides[0];
  const completedRides = rides.filter(r => currentUser && r.driverId === currentUser.id && r.status === 'completed');
  
  const [passengerLocationUrl, setPassengerLocationUrl] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const prevPendingCountRef = useRef(pendingRides.length);

  const handleAcceptRide = async (rideId: string, shared: boolean) => {
    if (hasActiveExclusive) {
      alert("Você não pode aceitar corridas enquanto estiver em uma Viagem Exclusiva.");
      return;
    }
    if (shared && activeSharedCount >= 3) {
      alert("Você já atingiu o limite de 3 vagas para viagens compartilhadas.");
      return;
    }
    if (!shared && activeSharedCount > 0) {
      alert("Você não pode aceitar uma viagem exclusiva enquanto tiver viagens compartilhadas em andamento.");
      return;
    }

    try {
      await updateRideStatus(rideId, 'accepted');
      setExpandedRideId(rideId);
      setActiveTab('active');
    } catch (error) {
      console.error(error);
      alert('Erro ao aceitar viagem. Esta corrida pode já ter sido aceita por outro motorista ou cancelada.');
    }
  };

  useEffect(() => {
    if (!activeRide) {
      setPassengerLocationUrl(null);
      return;
    }
    const q = query(
      collection(db, 'rides', activeRide.id, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const locationMsg = snapshot.docs
        .map(d => d.data())
        .reverse()
        .find(msg => msg.text && (msg.text.includes('📍 Passageiro local atual:') || msg.text.includes('📍 Minha localização atual:')));
      
      if (locationMsg) {
        const match = locationMsg.text.match(/https:\/\/[^ ]+/);
        if (match) {
          setPassengerLocationUrl(match[0]);
        }
      } else {
        setPassengerLocationUrl(null);
      }
    }, (error) => {
      console.error("Erro ao buscar localização do passageiro:", error);
    });
    return () => unsubscribe();
  }, [activeRide?.id]);

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

  useEffect(() => {
    if (activeTab === 'chat' && activeRides.length === 0) {
      setActiveTab('requests');
    }
  }, [activeRides.length, activeTab]);

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

          if (activeRide && currentUser) {
            addMessage({
              rideId: activeRide.id,
              senderId: currentUser.id,
              text: `📍 Motorista local atual: https://www.google.com/maps/search/?api=1&query=${position.coords.latitude},${position.coords.longitude}`
            });
            alert("Sua localização foi compartilhada no chat!");
          }
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

  const handleRouteToPassenger = () => {
    if (passengerLocationUrl) {
      window.open(passengerLocationUrl, '_blank');
    }
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (activeRide && currentUser) {
            addMessage({
              rideId: activeRide.id,
              senderId: currentUser.id,
              text: `📍 Motorista local atual: https://www.google.com/maps/search/?api=1&query=${position.coords.latitude},${position.coords.longitude}`
            });
          }
        },
        (error) => {
          console.error("Erro ao obter localização do motorista ao rotear", error);
        }
      );
    }
  };

  return (
    <div className="max-w-md w-full mx-auto h-full flex flex-col bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#0F172A] text-white p-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">Motorista</h2>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${isOnline ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
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
        {activeRides.length > 0 && (
          <button onClick={() => setActiveTab('chat')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 ${activeTab === 'chat' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-400'}`}>
            Chat
          </button>
        )}
        <button onClick={() => setActiveTab('earnings')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-wider ${activeTab === 'earnings' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-400'}`}>
          Rendimentos
        </button>
      </div>

      <div className={`flex-1 ${activeTab === 'chat' ? 'flex flex-col overflow-hidden p-2 bg-[#F8FAFC]' : 'overflow-y-auto p-4'}`}>
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {!isOnline ? (
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm mt-2 text-center min-h-[400px]">
                {/* Offline Visual */}
                <div className="relative flex items-center justify-center my-6 h-40 w-40">
                  <div className="absolute w-32 h-32 rounded-full bg-slate-50 border border-slate-200/60" />
                  <div className="relative z-10 w-16 h-16 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center shadow-sm">
                    <Navigation className="w-7 h-7 rotate-45 opacity-55" />
                  </div>
                </div>

                <div className="space-y-2 max-w-sm mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                    VOCÊ ESTÁ OFFLINE
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">Modo Offline Ativo</h3>
                  <p className="text-slate-500 text-sm">
                    Fique online para começar a receber solicitações de viagens e monitorar a demanda na região.
                  </p>
                </div>

                {/* Go Online Button */}
                <button 
                  onClick={() => setIsOnline(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 ring-4 ring-blue-100 text-xs uppercase tracking-wider text-center cursor-pointer"
                >
                  Ficar Online
                </button>
              </div>
            ) : isFullyBlocked ? (
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm mt-2 text-center min-h-[400px]">
                {/* Blocked Visual */}
                <div className="relative flex items-center justify-center my-6 h-40 w-40">
                  <div className="absolute w-32 h-32 rounded-full bg-slate-50 border border-slate-200/60" />
                  <div className="relative z-10 w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-md">
                    <XCircle className="w-8 h-8" />
                  </div>
                </div>

                <div className="space-y-2 max-w-sm">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    RECEBIMENTO BLOQUEADO
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">Bloqueado para Novas Corridas</h3>
                  <p className="text-slate-500 text-sm">
                    {hasActiveExclusive 
                      ? "Você possui uma Viagem Exclusiva em andamento." 
                      : "Você atingiu o limite de vagas para Viagens Compartilhadas (3 vagas ocupadas)."}
                  </p>
                </div>
              </div>
            ) : activeRides.length > 0 ? (
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm mt-2 text-center min-h-[400px]">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <Navigation className="w-8 h-8 rotate-45 opacity-60" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Viagem em Andamento</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                  Você possui uma viagem ativa no momento. Vá para a aba "Viagem Atual" para gerenciar a corrida ou conversar com o passageiro.
                </p>
                <button
                  onClick={() => setActiveTab('active')}
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-sm text-xs uppercase tracking-wider cursor-pointer"
                >
                  Ver Viagem Atual
                </button>
              </div>
            ) : pendingRides.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm mt-2 text-center min-h-[400px]">
                {/* Sonar Radar Visual */}
                <div className="relative flex items-center justify-center my-6 h-40 w-40">
                  <div 
                    className="absolute w-36 h-36 rounded-full border-2 border-orange-500/20 animate-ping"
                    style={{ animationDuration: '3s', animationDelay: '0s' }}
                  />
                  <div 
                    className="absolute w-28 h-28 rounded-full border-2 border-orange-500/20 animate-ping"
                    style={{ animationDuration: '3s', animationDelay: '1s' }}
                  />
                  <div 
                    className="absolute w-20 h-20 rounded-full border-2 border-orange-500/30 animate-ping"
                    style={{ animationDuration: '3s', animationDelay: '2s' }}
                  />
                  <div className="absolute w-32 h-32 rounded-full bg-orange-50/50 border border-orange-100" />
                  <div className="relative z-10 w-16 h-16 bg-gradient-to-tr from-orange-600 to-amber-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-600/30">
                    <Navigation className="w-7 h-7 rotate-45 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2 max-w-sm">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    ONLINE E BUSCANDO
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">Aguardando Novas Corridas</h3>
                  <p className="text-slate-500 text-sm">
                    Monitorando Novas Solicitações.
                  </p>
                </div>

                {/* Operational Map Route Card */}
                <div className="w-full mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-left space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rota Operacional Principal</p>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-600"></div>
                      <div className="w-0.5 h-4 bg-slate-300"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">Belo Horizonte (MG)</p>
                      <p className="text-xs font-bold text-slate-800">Conceição do Mato Dentro (MG)</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Demanda Estimada:</span>
                    <span className="font-bold text-orange-600 animate-pulse">ALTA</span>
                  </div>
                </div>

                {/* Go Offline Button */}
                <button 
                  onClick={() => setIsOnline(false)}
                  className="mt-6 text-xs font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-lg border border-slate-200 hover:border-red-200 transition-all uppercase tracking-wider cursor-pointer"
                >
                  Ficar Offline
                </button>
              </div>
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
                      className="flex-1 bg-red-100 text-red-600 py-3.5 rounded-xl font-bold hover:bg-red-200 transition-colors shadow-sm border border-red-200 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" /> Recusar
                    </button>
                    <button 
                      onClick={() => handleAcceptRide(ride.id, ride.shared)}
                      className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
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
          <div className="space-y-4">
            {activeRides.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm mt-2 text-center min-h-[350px]">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <Navigation className="w-8 h-8 rotate-45 opacity-40" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Sem Corrida Ativa</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-xs">
                  Você não está em nenhuma viagem no momento. Vá para a aba de solicitações para ver ou aceitar novas corridas.
                </p>
                <button
                  onClick={() => setActiveTab('requests')}
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-sm text-xs uppercase tracking-wider cursor-pointer"
                >
                  Ver Solicitações
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#0F172A] text-slate-300 p-4 rounded-xl text-xs font-semibold flex justify-between items-center shadow-sm">
                  <span>Viagens Ativas: {activeRides.length}</span>
                  <span>{hasActiveExclusive ? "Viagem Exclusiva" : `${activeSharedCount}/3 Vagas Compartilhadas`}</span>
                </div>
                
                {activeRides.map(ride => {
                  const isExpanded = activeRide?.id === ride.id;
                  const passengerName = users.find(u => u.id === ride.passengerId)?.name || 'Passageiro';
                  const isPassengerLocShared = activeRide?.id === ride.id && passengerLocationUrl;
                  
                  return (
                    <div key={ride.id} className={`bg-white rounded-2xl border shadow-sm transition-all overflow-hidden ${isExpanded ? 'border-orange-500 ring-2 ring-orange-100' : 'border-slate-200 hover:border-slate-300'}`}>
                      {/* Accordion / Card Header */}
                      <button 
                        type="button"
                        onClick={() => setExpandedRideId(isExpanded ? null : ride.id)}
                        className="w-full text-left p-4 flex justify-between items-center bg-slate-50/50 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{passengerName}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${ride.shared ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                              {ride.shared ? 'Compartilhada' : 'Exclusiva'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">{ride.from} → {ride.to}</p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <span className="font-extrabold text-slate-900 block">R$ {ride.price.toFixed(2)}</span>
                            <span className={`text-[9px] font-bold uppercase ${ride.status === 'in_progress' ? 'text-blue-600' : 'text-orange-600'}`}>
                              {ride.status === 'in_progress' ? 'Em andamento' : 'Aceita'}
                            </span>
                          </div>
                          <span className="text-slate-400 text-xs">
                            {isExpanded ? '▼' : '▶'}
                          </span>
                        </div>
                      </button>
                      
                      {/* Card Content (if expanded) */}
                      {isExpanded && (
                        <div className="p-5 space-y-6">
                          {isPassengerLocShared ? (
                            <div className="flex flex-col items-center text-center space-y-4">
                              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center animate-bounce mt-2 shadow-sm border border-blue-100">
                                <Navigation className="w-6 h-6 rotate-45" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-slate-900">Localização Recebida!</h3>
                                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                                  O passageiro compartilhou a localização dele.
                                </p>
                              </div>
                              <button
                                onClick={handleRouteToPassenger}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                              >
                                <Navigation className="w-4 h-4 rotate-45" />
                                Rotear no Google Maps
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Users className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Passageiro</p>
                                    <p className="text-sm font-bold text-slate-900">{passengerName}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="relative h-28 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center px-4">
                                <div className="absolute left-[20px] top-4 bottom-4 w-0.5 bg-slate-300"></div>
                                <div className="w-full space-y-4 relative z-10 pl-2">
                                   <div className="flex items-center gap-4">
                                      <div className="w-2.5 h-2.5 rounded-full bg-orange-600 outline outline-4 outline-white"></div>
                                      <div>
                                        <p className="text-xs font-bold text-slate-900">{ride.from}</p>
                                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Partida</p>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-4">
                                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 outline outline-4 outline-white shadow-sm"></div>
                                      <div>
                                        <p className="text-xs font-bold text-slate-900">{ride.to}</p>
                                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Destino</p>
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
                            </div>
                          )}

                          <div className="border-t border-slate-100 pt-5">
                            <button
                              onClick={() => {
                                setExpandedRideId(ride.id);
                                setActiveTab('chat');
                              }}
                              className="w-full py-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                            >
                              <span>💬 Conversar com Passageiro</span>
                            </button>
                          </div>

                          <div className="pt-2 flex gap-3">
                            {ride.status === 'accepted' ? (
                              <>
                                <button 
                                  onClick={async () => {
                                    try {
                                      await updateRideStatus(ride.id, 'in_progress');
                                    } catch (err) {
                                      alert('Erro ao iniciar corrida.');
                                    }
                                  }}
                                  className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-md text-xs uppercase tracking-wider"
                                >
                                  Iniciar corrida
                                </button>
                                <button 
                                  onClick={async () => {
                                    if (window.confirm('Tem certeza que deseja sair desta corrida?')) {
                                      try {
                                        await updateRideStatus(ride.id, 'cancelled');
                                      } catch (err) {
                                        alert('Erro ao cancelar corrida.');
                                      }
                                    }
                                  }}
                                  className="flex-1 bg-red-100 text-red-600 py-3 rounded-xl font-bold hover:bg-red-200 transition-colors shadow-sm border border-red-200 text-xs uppercase tracking-wider"
                                >
                                  Sair
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={async () => {
                                  try {
                                    await updateRideStatus(ride.id, 'completed');
                                  } catch (err) {
                                    alert('Erro ao finalizar corrida.');
                                  }
                                }}
                                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md text-xs uppercase tracking-wider"
                              >
                                Finalizar Viagem
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && activeRide && (
          <div className="flex-1 flex flex-col h-full bg-white rounded-t-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
              <p className="text-xs font-bold text-slate-800">
                Passageiro: {users.find(u => u.id === activeRide.passengerId)?.name || 'Passageiro'}
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                Corrida: {activeRide.from} → {activeRide.to}
              </p>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              <Chat 
                rideId={activeRide.id} 
                currentUserId={currentUser.id} 
                className="flex-1 h-full border-0 rounded-none bg-transparent"
              />
            </div>
          </div>
        )}

        {activeTab === 'chat' && !activeRide && (
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm mt-2 text-center min-h-[350px]">
            <p className="text-slate-500 text-sm">Nenhum chat ativo no momento.</p>
          </div>
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
