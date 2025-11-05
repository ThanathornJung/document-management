'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import PageWrapper from '../../components/PageWrapper';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'admin') {
      Swal.fire({
        title: 'Unauthorized',
        text: 'You do not have permission to view this page.',
        icon: 'error',
        confirmButtonText: 'OK'
      }).then(() => {
        router.push('/');
      });
      return;
    }
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || user?.role !== 'admin') {
    return null; // Render nothing while redirecting or showing alert
  }

  return (
    <PageWrapper>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-8 text-center text-gray-800">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/users" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Manage Users</h2>
          <p className="text-gray-600">View, edit, and manage user accounts and roles.</p>
        </Link>
        <Link href="/admin/documents" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Manage Documents</h2>
          <p className="text-gray-600">View and manage all uploaded documents.</p>
        </Link>
        <Link href="/admin/logs" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">View System Logs</h2>
          <p className="text-gray-600">Access and review all system activity logs.</p>
        </Link>
      </div>
    </PageWrapper>
  );
}
