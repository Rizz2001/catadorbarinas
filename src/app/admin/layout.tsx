import React from 'react';
import { redirect } from 'next/navigation';
import { createClientForServer } from '@/lib/supabase/server';
import { AdminSidebar, AdminThemeProvider } from '@/components/admin';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Consola Operativa CMS | Gran Catador Barinas',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClientForServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/admin/pedidos');
  }

  const { data: perfil } = (await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()) as { data: { rol: string } | null };

  if (!perfil || perfil.rol !== 'admin') {
    redirect('/?error=unauthorized');
  }

  return (
    <AdminThemeProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-[#F7F8FA] text-slate-900 pb-20 md:pb-0">
        <AdminSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </AdminThemeProvider>
  );
}
