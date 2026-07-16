'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/StoreProvider';
import { Send, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import type { Message } from '@/lib/types';

export default function Chat({ 
  rideId, 
  currentUserId, 
  className = "h-72 border border-slate-200 rounded-2xl" 
}: { 
  rideId: string; 
  currentUserId: string; 
  className?: string; 
}) {
  const { addMessage } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'rides', rideId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          rideId,
          senderId: data.senderId,
          text: data.text,
          imageUrl: data.imageUrl,
          timestamp: data.timestamp?.toDate 
            ? data.timestamp.toDate().toISOString() 
            : (typeof data.timestamp === 'string' ? data.timestamp : new Date().toISOString())
        } as Message;
      });
      setMessages(msgs);
    }, (error) => {
      console.error("Error listening to messages:", error);
    });
    return () => unsubscribe();
  }, [rideId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    addMessage({
      rideId,
      senderId: currentUserId,
      text: text.trim()
    });
    setText('');
  };

  const handleSendImage = () => {
    addMessage({
      rideId,
      senderId: currentUserId,
      imageUrl: 'https://picsum.photos/seed/point/300/200'
    });
  };

  return (
    <div className={`flex flex-col overflow-hidden bg-[#F8FAFC] ${className}`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-3">
              <Send className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-xs font-medium text-slate-500">Nenhuma mensagem ainda.</p>
            <p className="text-[10px] text-slate-400 mt-1">Inicie o chat para combinar o ponto.</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${isMe ? 'bg-orange-600 text-white rounded-br-sm' : 'bg-white border border-slate-100 rounded-bl-sm text-slate-900'}`}>
                  {msg.text && (
                    <p className="text-sm font-medium">
                      {msg.text.includes('https://') ? (
                        <a 
                          href={msg.text.match(/https:\/\/[^ ]+/)?.[0] || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`underline break-all ${isMe ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}
                        >
                          {msg.text}
                        </a>
                      ) : (
                        msg.text
                      )}
                    </p>
                  )}
                  {msg.imageUrl && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={msg.imageUrl} alt="Anexo" className="rounded-xl mt-2 w-full max-w-[200px] border border-black/10" />
                    </>
                  )}
                </div>
                <span suppressHydrationWarning className="text-[10px] text-slate-400 mt-1 font-medium px-1">{(msg.timestamp && !isNaN(new Date(msg.timestamp).getTime()) ? format(new Date(msg.timestamp), 'HH:mm') : '--:--')}</span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <button type="button" onClick={handleSendImage} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors">
            <ImageIcon className="w-5 h-5" />
          </button>
          <input 
            type="text" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Sua mensagem..." 
            className="flex-1 min-w-0 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900 placeholder:text-slate-400"
          />
          <button type="submit" disabled={!text.trim()} className="p-3 bg-orange-600 text-white rounded-xl disabled:opacity-50 hover:bg-orange-700 transition-colors shadow-sm">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
