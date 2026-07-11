'use client';
import dynamic from 'next/dynamic';
const DriverClient = dynamic(() => import('./DriverClient'), { ssr: false });
export default function Page() { return <DriverClient />; }
