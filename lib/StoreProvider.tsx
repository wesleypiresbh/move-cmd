'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Ride, Message, Role, Location } from './types';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, serverTimestamp, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './firebase-helpers';

type AppState = {
  currentUser: User | null;
  setCurrentRole: (role: Role) => void;
  users: User[];
  toggleUserStatus: (id: string) => void;
  addUser: (user: Omit<User, 'id'>, uid?: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addCar: (carData: Omit<Car, 'id'>) => Promise<void>;
  rides: Ride[];
  addRide: (ride: Omit<Ride, 'id' | 'status' | 'date'> & { date?: string }) => Promise<void>;
  updateRideStatus: (id: string, status: Ride['status']) => Promise<void>;
  messages: Message[];
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;
  loading: boolean;
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<Role>('passenger'); // Fallback

    useEffect(() => {
    let unsubUserDoc;
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('onAuthStateChanged', firebaseUser?.uid);
      if (unsubUserDoc) unsubUserDoc();
      if (firebaseUser) {
        unsubUserDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), (userDoc) => {
          console.log('userDoc exists?', userDoc.exists());
          if (userDoc.exists()) {
            const userData = { id: userDoc.id, ...userDoc.data() } as User;
            setCurrentUser(userData);
            setCurrentRole(userData.role);
          } else {
        setCurrentUser(null);
        setLoading(false);
      }
          setLoading(false);
        }, (error) => {
          setLoading(false);
          console.log('userDoc ERROR', error);
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubUserDoc) unsubUserDoc();
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    
    // Listen to users (admin only or for profile lookup)
    let unsubUsers: (() => void) | undefined;
    if (currentUser.role === 'admin' || currentUser.active) {
      unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        const usersData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
        setUsers(usersData);
      }, (error) => {
        console.error("Error listening to users:", error);
      });
    } else {
      // If not admin and not active, just set the user list to themselves
      setUsers([currentUser]);
    }

    // Listen to rides
    const unsubRides = onSnapshot(query(collection(db, 'rides')), (snapshot) => {
      const ridesData = snapshot.docs.map(d => {
        const data = d.data();
        return { 
          id: d.id, 
          ...data,
          date: data.date || (data.createdAt ? new Date(data.createdAt.toMillis()).toISOString() : new Date().toISOString())
        } as Ride;
      });
      // sort manually since we don't have composite index yet maybe
      ridesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRides(ridesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'rides');
    });

    // Listen to messages (for all rides, just for demo. In real app, listen per ride)
    // Note: Due to security rules, this might fail if we query across all messages for all rides if we are not admin.
    // For simplicity, we won't listen to all messages here, but we will mock it or leave it empty unless viewing a ride.
    // Wait, the rules allow read for rides/{rideId}/messages if you are passenger or driver of that ride.
    // So we can't do a collection group query without an index and rule change.
    // We'll leave messages empty initially, and in a real component we'd fetch messages per ride.

    return () => {
      if (unsubUsers) unsubUsers();
      unsubRides();
    };
  }, [currentUser]);

  const toggleUserStatus = async (id: string) => {
    try {
      const userToToggle = users.find(u => u.id === id);
      if (userToToggle) {
        await updateDoc(doc(db, 'users', id), {
          active: !userToToggle.active,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${id}`);
    }
  };

  const addUser = async (userData: Omit<User, 'id'>, uid?: string) => {
    try {
      const newId = uid || Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'users', newId), {
        ...userData,
        // removed serverTimestamp() to prevent hanging
        // createdAt: serverTimestamp(),
        // updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users`);
    }
  };

  
  const addCar = async (carData: Omit<Car, 'id'>) => {
    try {
      const newId = Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'cars', newId), {
        ...carData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'cars');
       // Rethrow to show alert
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${id}`);
      
    }
  };

  const addRide = async (rideData: Omit<Ride, 'id' | 'status' | 'date'> & { date?: string }) => {
    if (!currentUser) return;
    try {
      const newId = Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'rides', newId), {
        ...rideData,
        status: 'pending',
        date: rideData.date || new Date().toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'rides');
    }
  };

  const updateRideStatus = async (id: string, status: Ride['status']) => {
    if (!currentUser) return;
    try {
      const updates: any = { status, updatedAt: serverTimestamp() };
      if (status === 'accepted') {
        updates.driverId = currentUser.id;
      }
      await updateDoc(doc(db, 'rides', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rides/${id}`); 
    }
  };

  const addMessage = async (msgData: Omit<Message, 'id' | 'timestamp'>) => {
    if (!currentUser) return;
    try {
      const newId = Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'rides', msgData.rideId, 'messages', newId), {
        ...msgData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `rides/${msgData.rideId}/messages`);
    }
  };

  return (
    <AppContext.Provider value={{ currentUser, setCurrentRole, users, toggleUserStatus, addUser, deleteUser, rides, addRide, updateRideStatus, messages, addMessage, loading }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
};
