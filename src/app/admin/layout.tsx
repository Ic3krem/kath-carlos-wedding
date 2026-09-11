'use client';

import { usePathname } from 'next/navigation';
import { AdminNav } from '@/components/admin/AdminNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  return (
    <div className="min-h-screen bg-white">
      {!isLoginPage && <AdminNav />}
      {children}
    </div>
  );
}
