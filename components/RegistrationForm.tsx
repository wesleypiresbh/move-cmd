'use client';

import React, { useState } from 'react';
import { Users, Car, Shield, Briefcase, Plus, Save } from 'lucide-react';
import { useAppStore } from '@/lib/StoreProvider';

type EntityType = 'driver' | 'car' | 'admin' | 'operator';

export default function RegistrationForm() {
  const { addUser, addCar } = useAppStore();
  const [activeEntity, setActiveEntity] = useState<EntityType>('driver');
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeEntity === 'driver' && (!formData.name || !formData.email || !formData.phone || !formData.cnh)) {
        alert('Todos os campos são de preenchimento obrigatório para motoristas.');
        return;
      }
      if (activeEntity === 'car') {
        await addCar({
          model: formData.model || '',
          plate: formData.plate || '',
          capacity: parseInt(formData.capacity) || 3,
          color: formData.color || '',
          driverId: formData.driverId || ''
        });
      } else if (activeEntity === 'driver' || activeEntity === 'admin' || activeEntity === 'operator') {
        await addUser({
          name: formData.name,
          email: formData.email,
          role: activeEntity,
          rating: 5,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}`,
          phone: formData.phone || '',
          
          cnh: formData.cnh || '',
          active: true
        });
      }
      alert(`Cadastro de ${activeEntity} realizado com sucesso!`);
      setFormData({});
    } catch (err) {
      alert('Erro ao realizar o cadastro. Verifique os dados e tente novamente.');
      console.error(err);
    }
  };

  const renderFormFields = () => {
    switch (activeEntity) {
      case 'driver':
      case 'admin':
      case 'operator':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-wider">Nome Completo</label>
                <input required name="name" value={formData.name || ''} onChange={handleInputChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900" placeholder="Nome Completo" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-wider">Email</label>
                <input required name="email" value={formData.email || ''} onChange={handleInputChange} type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900" placeholder="email@exemplo.com" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-wider">Telefone</label>
                <input required name="phone" value={formData.phone || ''} onChange={handleInputChange} type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900" placeholder="(31) 99999-9999" />
              </div>

              {activeEntity === 'driver' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-wider">CNH</label>
                  <input required name="cnh" value={formData.cnh || ''} onChange={handleInputChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900" placeholder="Número da CNH" />
                </div>
              )}
            </div>
          </>
        );
      case 'car':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-wider">Modelo</label>
                <input required name="model" value={formData.model || ''} onChange={handleInputChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900" placeholder="Ex: Chevrolet Onix" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-wider">Placa</label>
                <input required name="plate" value={formData.plate || ''} onChange={handleInputChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900" placeholder="ABC-1234" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-wider">Cor</label>
                  <input required name="color" value={formData.color || ''} onChange={handleInputChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900" placeholder="Ex: Prata" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-wider">Vagas Disponíveis (Máx 3)</label>
                  <input required name="capacity" value={formData.capacity !== undefined ? formData.capacity : '3'} onChange={handleInputChange} type="number" min="1" max="3" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900" placeholder="3" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-wider">Motorista Responsável (ID)</label>
                <input required name="driverId" value={formData.driverId || ''} onChange={handleInputChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900" placeholder="ID do Motorista" />
              </div>
            </div>
          </>
        );
    }
  };

  const getEntityTitle = () => {
    switch (activeEntity) {
      case 'driver': return 'Novo Motorista';
      case 'car': return 'Novo Veículo';
      case 'admin': return 'Novo Administrador';
      case 'operator': return 'Novo Operador';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-2">
        <button onClick={() => { setActiveEntity('driver'); setFormData({}); }} className={`flex flex-col items-center justify-center p-3 rounded-xl border ${activeEntity === 'driver' ? 'border-orange-600 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>
          <Users className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Motorista</span>
        </button>
        <button onClick={() => { setActiveEntity('car'); setFormData({ capacity: '3' }); }} className={`flex flex-col items-center justify-center p-3 rounded-xl border ${activeEntity === 'car' ? 'border-orange-600 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>
          <Car className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Veículo</span>
        </button>
        <button onClick={() => { setActiveEntity('admin'); setFormData({}); }} className={`flex flex-col items-center justify-center p-3 rounded-xl border ${activeEntity === 'admin' ? 'border-orange-600 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>
          <Shield className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Admin</span>
        </button>
        <button onClick={() => { setActiveEntity('operator'); setFormData({}); }} className={`flex flex-col items-center justify-center p-3 rounded-xl border ${activeEntity === 'operator' ? 'border-orange-600 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>
          <Briefcase className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Operador</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
          <Plus className="w-5 h-5 text-orange-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{getEntityTitle()}</h3>
        </div>

        <form onSubmit={handleSubmit}>
          {renderFormFields()}

          <div className="mt-8 pt-4 border-t border-slate-100">
            <button type="submit" className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-md flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Salvar Cadastro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
