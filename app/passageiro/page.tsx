'use client';
import dynamic from 'next/dynamic';
const PassengerClient = dynamic(() => import('./PassengerClient'), { ssr: false });
export default function Page() { return <PassengerClient />; }
