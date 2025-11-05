'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import PageWrapper from '../../../components/PageWrapper';
import Swal from 'sweetalert2';

interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  tel?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminUsersPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // Removed setPageSize as it's not used
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  const handleSort = useCallback((column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
  }, [sortBy, sortOrder]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/users?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      Swal.fire({
        title: 'Error',
        text: err instanceof Error ? err.message : 'An unknown error occurred while fetching users.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, sortOrder]); // Add all dependencies of fetchUsers

  const handleRoleChange = useCallback(async (userId: number, newRole: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user role');
      }

      Swal.fire({
        title: 'Success!',
        text: 'User role updated successfully.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      fetchUsers(); // Re-fetch users to update the list
    } catch (err) {
      console.error('Error updating user role:', err);
      Swal.fire({
        title: 'Error',
        text: err instanceof Error ? err.message : 'An unknown error occurred while updating user role.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  }, [fetchUsers]); // fetchUsers is a dependency

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    } else if (user?.role !== 'admin') {
      Swal.fire({
        title: 'Unauthorized',
        text: 'You do not have permission to view this page.',
        icon: 'warning',
        confirmButtonText: 'OK'
      }).then(() => {
        router.push('/');
      });
    } else {
      fetchUsers();
    }
  }, [isLoggedIn, user, router, fetchUsers]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (loading) {
    return <PageWrapper><p>Loading users...</p></PageWrapper>;
  }

  if (error) {
    return <PageWrapper><p className="text-red-500">Error: {error}</p></PageWrapper>;
  }

  return (
    <PageWrapper>
      <h1 className="text-2xl font-semibold mb-6">User Management</h1>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer">
                ID {sortBy === 'id' && (sortOrder === 'ASC' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('username')} className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer">
                Username {sortBy === 'username' && (sortOrder === 'ASC' ? '▲' : '▼')}
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tel
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Role
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {user.id}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {user.username}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {user.email}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {user.tel}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {/* Actions like edit/delete can be added here */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => handlePageChange(page + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Next
        </button>
      </div>
    </PageWrapper>
  );
}
