"use client";
import React, { useState } from 'react';
import { Logo } from './Logo';
import type { Role } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAppStore } from '@/lib/StoreProvider';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';

interface LoginFormProps {
  type: 'admin' | 'motorista' | 'passageiro';
  onLogin: (role: Role) => void;
}

export function LoginForm({ type, onLogin }: LoginFormProps) {
  const { addUser, users } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cnh, setCnh] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getThemeClasses = () => {
    switch (type) {
      case 'admin':
        return {
          focusRing: 'focus:ring-emerald-500/20 focus:border-emerald-500',
          button: 'bg-emerald-500 hover:bg-emerald-600 text-white',
          textHover: 'hover:text-emerald-600'
        };
      case 'motorista':
        return {
          focusRing: 'focus:ring-blue-600/20 focus:border-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          textHover: 'hover:text-blue-600'
        };
      case 'passageiro':
      default:
        return {
          focusRing: 'focus:ring-orange-500/20 focus:border-orange-500',
          button: 'bg-orange-500 hover:bg-orange-600 text-white',
          textHover: 'hover:text-orange-600'
        };
    }
  };

  const theme = getThemeClasses();

  const handleLogin = async (e: React.FormEvent) => {
    console.log('handleLogin start', { isSignUp, email, type });
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (type === 'admin' && email === 'masteradmin@movecms.com' && password === 'casabranca') {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        try {
          const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await addUser({
            name: 'Master Admin',
            email: email,
            role: 'admin',
            rating: 5,
            avatar: 'https://ui-avatars.com/api/?name=Master+Admin',
            active: true
          }, userCred.user.uid);
        } catch (createErr: any) {
          console.error(createErr);
          setError('Erro ao criar conta admin: ' + createErr.message);
          setLoading(false);
          return;
        }
      }
      onLogin('admin');
      setLoading(false);
      return;
    }

    let foundUser = undefined;
    try {
      if (isSignUp) {
        if (!name || !email || !password || !phone || (type === 'motorista' && !cnh)) {
          setError('Todos os campos são de preenchimento obrigatório.');
          setLoading(false);
          return;
        }
        try {
          const userCred = await createUserWithEmailAndPassword(auth, email, password);
          await addUser({
            name: name || email.split('@')[0],
            email: email,
            phone: phone,
            role: type === 'motorista' ? 'driver' : 'passenger',
            rating: 5,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email.split('@')[0])}`,
            ...(type === 'motorista' ? { cnh } : {}),
            active: type === 'motorista' ? false : true
          }, userCred.user.uid);
          
          auth.signOut().catch(console.error); // Do not await to prevent hanging
          
          if (type === 'motorista') {
            setSuccess('Cadastro realizado com sucesso! Sua conta está pendente de aprovação por um administrador.');
          } else {
            setSuccess('Bem-vindo! Cadastro realizado com sucesso! Faça login para continuar.');
          }
          setLoading(false);
          setIsSignUp(false);
          return;
        } catch (error: any) {
          if (error.code === 'auth/email-already-in-use') {
            try {
              const userCred = await signInWithEmailAndPassword(auth, email, password);
              await addUser({
                name: name || email.split('@')[0],
                email: email,
                phone: phone,
                role: type === 'motorista' ? 'driver' : 'passenger',
                rating: 5,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email.split('@')[0])}`,
                ...(type === 'motorista' ? { cnh } : {}),
                active: type === 'motorista' ? false : true
              }, userCred.user.uid);
              
              auth.signOut().catch(console.error);
              
              if (type === 'motorista') {
                setSuccess('Cadastro reativado com sucesso! Sua conta está pendente de aprovação.');
              } else {
                setSuccess('Cadastro reativado com sucesso! Faça login para continuar.');
              }
              setLoading(false);
              setIsSignUp(false);
              return;
            } catch (signInErr: any) {
              setError('Este email já está em uso por outra conta ou a senha está incorreta.');
              setLoading(false);
              return;
            }
          }
          setError(error.message || 'Erro ao criar conta. Tente novamente.');
          setLoading(false);
          return;
        }
      } else {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          foundUser = querySnapshot.docs[0].data();
        }

        if (foundUser && foundUser.active === false) {
          setError('Sua conta está pendente de aprovação por um administrador.');
          setLoading(false);
          return;
        }
        
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        
        // If the user has a firestore doc but auth was re-created with different uid somehow, this would fail the snapshot later.
        if (foundUser && !querySnapshot.empty && querySnapshot.docs[0].id !== userCred.user.uid) {
           // Fix it by writing the foundUser data to the correct auth uid document
           await setDoc(doc(db, 'users', userCred.user.uid), foundUser);
        }
      }
      
      if (type === 'admin') {
        if (foundUser) {
          if (foundUser.role === 'admin' || foundUser.role === 'operator') {
            onLogin(foundUser.role);
          } else {
            auth.signOut();
            throw new Error('Acesso negado. Esta conta não possui privilégios administrativos.');
          }
        } else {
          onLogin('admin'); // Fallback for masteradmin or first-time
        }
      } else if (type === 'motorista') {
        if (foundUser && foundUser.role !== 'driver') {
          auth.signOut();
          throw new Error('Acesso negado. Esta conta não é de um motorista.');
        }
        onLogin('driver');
      } else {
        if (foundUser && foundUser.role !== 'passenger') {
          auth.signOut();
          throw new Error('Acesso negado. Tipo de conta incorreto.');
        }
        onLogin('passenger');
      }
    } catch (err: any) {
      console.log('catch error:', err);
      setError(err.message || 'Erro ao autenticar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'admin': return 'Acesso Administrativo';
      case 'motorista': return 'Acesso do Motorista';
      case 'passageiro': return 'Acesso do Passageiro';
    }
  };

  const getSubtitle = () => {
    if (isSignUp) return 'Crie sua conta para continuar';
    switch (type) {
      case 'admin': return 'Gerencie a plataforma Move-CMD';
      case 'motorista': return 'Gerencie suas corridas e ganhos';
      case 'passageiro': return 'Solicite corridas rapidamente';
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <Logo className="w-48 mx-auto mb-8" type={type} />
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {getTitle()}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {getSubtitle()}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl">
              {success}
            </div>
          )}
          {isSignUp && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Completo</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-colors ${theme.focusRing}`}
                placeholder="Seu nome"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-colors ${theme.focusRing}`}
              placeholder="seu@email.com"
            />
          </div>
          {isSignUp && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Telefone</label>
              <input 
                type="tel" 
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-colors ${theme.focusRing}`}
                placeholder="(31) 99999-9999"
              />
            </div>
          )}
          {isSignUp && type === 'motorista' && (
            <>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">CNH</label>
                <input 
                  type="text" 
                  required
                  value={cnh}
                  onChange={e => setCnh(e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-colors ${theme.focusRing}`}
                  placeholder="Número da CNH"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-colors ${theme.focusRing}`}
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-4 font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 ${theme.button}`}
          >
            {loading ? 'Aguarde...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
          </button>
        </form>

        {type !== 'admin' && (
          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className={`text-sm font-semibold text-slate-500 transition-colors ${theme.textHover}`}
            >
              {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem conta? Criar uma'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
