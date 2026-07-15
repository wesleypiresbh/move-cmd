'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/StoreProvider';
import type { Location } from '@/lib/types';
import { MapPin, Users, CreditCard, Clock, ChevronRight, Car, Navigation2, LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Chat from './Chat';

const LOCATIONS: Location[] = ['Belo Horizonte', 'Conceição do Mato Dentro', 'Lagoa Santa'];

export default function PassengerDashboard() {
  const { currentUser, rides, addRide, updateRideStatus, loading, addMessage } = useAppStore();
   
   
  const [from, setFrom] = useState<Location>('Belo Horizonte');
  const [to, setTo] = useState<Location>('Conceição do Mato Dentro');
  const [rideType, setRideType] = useState<'shared' | 'exclusive'>('shared');
  const [activeTab, setActiveTab] = useState<'book' | 'history' | 'active'>('book');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isBookingMode, setIsBookingMode] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [showChat, setShowChat] = useState(false);

  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Aguardando Motorista';
      case 'accepted': return 'Motorista a Caminho';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Finalizada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const myRides = rides.filter(r => currentUser && r.passengerId === currentUser.id);
  const activeRide = myRides.find(r => r.status === 'pending' || r.status === 'accepted' || r.status === 'in_progress');
  const isLocationRequired = activeRide?.status === 'accepted' && !userLocation;

  const previousStatusRef = React.useRef(activeRide?.status);
  const locationButtonRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (previousStatusRef.current !== 'accepted' && activeRide?.status === 'accepted') {
      alert('Sua viagem foi aceita pelo motorista! Por favor, compartilhe sua localização exata para que ele possa te buscar.');
      setActiveTab('book');
      setTimeout(() => {
        locationButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
    previousStatusRef.current = activeRide?.status;
  }, [activeRide?.status]);

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando dados do usuário...</div>;
  if (!currentUser) return <div className="p-8 text-center bg-white m-4 rounded-xl shadow-sm border border-red-200 text-red-600">Perfil não encontrado.</div>;


  // Pricing logic
  let basePrice = 100;
  if (from === 'Lagoa Santa' || to === 'Lagoa Santa') {
    basePrice = 60; // 40% discount
  }
  
  const totalPrice = rideType === 'exclusive' ? basePrice * 3 : basePrice;

  const handleBook = () => {
    if (from === to) return alert('Selecione destinos diferentes.');
    if (rideType === 'exclusive' && !scheduleDate) return alert('Selecione a data e hora do agendamento.');
    addRide({
      passengerId: currentUser.id,
      from,
      to,
      price: totalPrice,
      shared: rideType === 'shared',
      ...(rideType === 'exclusive' && scheduleDate ? { date: new Date(scheduleDate).toISOString() } : {})
    });
    setIsBookingMode(false);
  };

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
              text: `📍 Minha localização atual: https://www.google.com/maps/search/?api=1&query=${position.coords.latitude},${position.coords.longitude}`
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

  return (
    <div className="max-w-md w-full mx-auto h-full flex flex-col bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Olá, {currentUser.name.split(' ')[0]}</h2>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
            <span className="text-orange-500">★</span> {(currentUser.rating || 5).toFixed(1)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
          <button 
            onClick={() => signOut(auth)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white">
        <button onClick={() => setActiveTab('book')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider ${activeTab === 'book' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-400'}`}>
          Nova Viagem
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider ${activeTab === 'history' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-400'}`}>
          Histórico
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'book' && (
          <div className="space-y-6">
            {activeRide ? (
              isLocationRequired ? (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center space-y-6">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center animate-bounce mt-4 shadow-sm border border-blue-100">
                    <Navigation2 className="w-8 h-8 rotate-45" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Localização Requerida</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
                      O motorista aceitou sua viagem! Por favor, compartilhe sua localização atual para que ele possa ir até você.
                    </p>
                  </div>
                  
                  <button
                    ref={locationButtonRef}
                    onClick={handleRequestLocation}
                    disabled={locationLoading}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 shadow-md flex items-center justify-center gap-2 ring-4 ring-blue-100 animate-pulse text-xs uppercase tracking-wider"
                  >
                    <Navigation2 className="w-4 h-4" />
                    {locationLoading ? 'Localizando...' : 'Compartilhar Minha Localização'}
                  </button>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja cancelar esta viagem?')) {
                          updateRideStatus(activeRide.id, 'cancelled').then(() => setIsBookingMode(false)).catch(e => { console.error(e); alert('Erro ao cancelar corrida.'); });
                        }
                      }}
                      className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                    >
                      Cancelar Viagem
                    </button>
                  </div>

                  {/* Chat Integration */}
                  <div className="w-full border-t border-slate-100 pt-6">
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className="w-full py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                    >
                      <span>💬 {showChat ? 'Ocultar Mensagens' : 'Conversar com Motorista'}</span>
                    </button>
                    {showChat && (
                      <div className="mt-4 text-left w-full">
                        <Chat rideId={activeRide.id} currentUserId={currentUser.id} />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  {activeRide.status === 'in_progress' ? (
                    <div className="flex flex-col items-start gap-1 mb-6 pb-4 border-b border-slate-100">
                      <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                        Rota Ativa
                      </span>
                      <span className="text-xl font-extrabold text-blue-800">
                        {activeRide.shared ? 'Compartilhada' : 'Exclusiva'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 mt-1.5 uppercase tracking-wider animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                        Em Andamento
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-900 text-lg">Rota Ativa</h3>
                        <span className="px-2 py-0.5 text-[10px] rounded bg-orange-50 text-orange-600 font-bold uppercase tracking-wider border border-orange-100">
                          {activeRide.shared ? 'Compartilhada' : 'Exclusiva'}
                        </span>
                      </div>
                      <span className="px-3 py-1 text-[10px] rounded-full bg-slate-100 text-slate-600 font-bold tracking-wider uppercase border border-slate-200">
                        {getStatusLabel(activeRide.status)}
                      </span>
                    </div>
                  )}
                  {!activeRide.shared && activeRide.date && (
                    <div className="mb-6 flex items-center gap-3 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
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
                  
                  <div className="pt-2 flex flex-col items-center gap-3">
                    <button
                      ref={locationButtonRef}
                      onClick={handleRequestLocation}
                      disabled={locationLoading}
                      className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border transition-all duration-500 ${userLocation ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : (activeRide?.status === 'accepted' ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-4 ring-blue-100 hover:bg-blue-700 animate-pulse' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100')}`}
                    >
                      <Navigation2 className="w-3.5 h-3.5" />
                      {locationLoading ? 'Localizando...' : userLocation ? 'Localização Ativa' : 'Compartilhar Minha Localização'}
                    </button>

                    {(activeRide.status === 'pending' || activeRide.status === 'accepted') && (
                      <button
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja cancelar esta viagem?')) {
                            updateRideStatus(activeRide.id, 'cancelled').then(() => setIsBookingMode(false)).catch(e => { console.error(e); alert('Erro ao cancelar corrida.'); });
                          }
                        }}
                        className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                      >
                        Cancelar Viagem Agendada
                      </button>
                    )}
                  </div>

                  {/* Chat Integration */}
                  <div className="border-t border-slate-100 pt-6">
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className="w-full py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                    >
                      <span>💬 {showChat ? 'Ocultar Mensagens' : 'Conversar com Motorista'}</span>
                    </button>
                    {showChat && (
                      <div className="mt-4">
                        <Chat rideId={activeRide.id} currentUserId={currentUser.id} />
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : (
              !isBookingMode ? (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center space-y-6 mt-4">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mb-2 shadow-inner">
                    <Car className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Para onde vamos?</h3>
                    <p className="text-sm text-slate-500 max-w-[250px] mx-auto">Solicite uma corrida exclusiva ou compartilhe sua viagem com segurança.</p>
                  </div>
                  <button 
                    onClick={() => setIsBookingMode(true)}
                    className="w-full mt-4 py-4 bg-orange-600 text-white rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/30 active:scale-[0.98]"
                  >
                    Escolha a sua viagem
                  </button>
                </div>
              ) : (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <div className="space-y-4 relative">
                  <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-slate-300"></div>
                  
                  <div className="relative z-10">
                    <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-wider">Partida</label>
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="w-3 h-3 rounded-full bg-orange-600 shrink-0 outline outline-4 outline-white"></div>
                      <select 
                        className="bg-transparent w-full outline-none text-sm font-bold text-slate-700"
                        value={from}
                        onChange={(e) => setFrom(e.target.value as Location)}
                      >
                        {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-wider">Destino</label>
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="w-3 h-3 rounded-full bg-slate-400 shrink-0 outline outline-4 outline-white"></div>
                      <select 
                        className="bg-transparent w-full outline-none text-sm font-bold text-slate-700"
                        value={to}
                        onChange={(e) => setTo(e.target.value as Location)}
                      >
                        {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${rideType === 'shared' ? 'border-orange-600 bg-orange-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input type="radio" checked={rideType === 'shared'} onChange={() => setRideType('shared')} className="w-4 h-4 accent-orange-600" />
                    <div className="flex-1">
                      <p className={`text-sm font-bold flex items-center gap-2 ${rideType === 'shared' ? 'text-orange-900' : 'text-slate-700'}`}>
                        <Users className="w-4 h-4" /> Viagem Compartilhada
                      </p>
                      <p className={`text-xs mt-0.5 ${rideType === 'shared' ? 'text-orange-600/80' : 'text-slate-500'}`}>1 vaga • Divide com outros</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${rideType === 'shared' ? 'text-orange-700' : 'text-slate-900'}`}>R$ {basePrice.toFixed(2)}</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${rideType === 'exclusive' ? 'border-orange-600 bg-orange-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input type="radio" checked={rideType === 'exclusive'} onChange={() => setRideType('exclusive')} className="w-4 h-4 accent-orange-600" />
                    <div className="flex-1">
                      <p className={`text-sm font-bold flex items-center gap-2 ${rideType === 'exclusive' ? 'text-orange-900' : 'text-slate-700'}`}>
                        <Car className="w-4 h-4" /> Viagem Exclusiva
                      </p>
                      <p className={`text-xs mt-0.5 ${rideType === 'exclusive' ? 'text-orange-600/80' : 'text-slate-500'}`}>Carro inteiro (3 vagas)</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${rideType === 'exclusive' ? 'text-orange-700' : 'text-slate-900'}`}>R$ {(basePrice * 3).toFixed(2)}</p>
                    </div>
                  </label>
                  {rideType === 'exclusive' && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                      <label className="text-[10px] font-bold text-orange-600 mb-2 block uppercase tracking-wider">Agendar Viagem (Obrigatório)</label>
                      <input 
                        type="datetime-local" 
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full bg-white border border-orange-200 rounded-lg p-2 text-sm font-bold text-slate-700 outline-none focus:border-orange-500"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor Total Estimado</span>
                    <span className="text-2xl font-bold text-slate-900">R$ {totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 p-3 rounded-xl mb-6">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium">100% repasse direto ao motorista.</span>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsBookingMode(false)}
                      className="w-1/3 bg-slate-100 text-slate-600 py-4 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-slate-200 transition-colors"
                    >
                      Voltar
                    </button>
                    <button 
                      onClick={handleBook}
                      disabled={from === to}
                      className="flex-1 bg-orange-600 text-white py-4 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-md"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </div>
              )
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {myRides.map(ride => (
              <div key={ride.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span suppressHydrationWarning className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {format(new Date(ride.date), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{ride.from} → {ride.to}</p>
                  <p className="text-[10px] font-medium text-slate-500 mt-1.5 uppercase tracking-wider">Status: {getStatusLabel(ride.status)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-lg">R$ {(ride.price || 0).toFixed(2)}</p>
                  {ride.shared && <Users className="w-4 h-4 text-orange-400 inline-block mt-1" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
