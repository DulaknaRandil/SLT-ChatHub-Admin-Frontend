"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    // redirect visitors to admin login by default
    router.push('/admin/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <div className="mb-4">Redirecting to Admin Login...</div>
        <a className="text-sky-600 underline" href="/admin/login">Open Admin Login</a>
      </div>
    </div>
  );
}
