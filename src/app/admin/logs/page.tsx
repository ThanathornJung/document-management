'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import PageWrapper from '../../../components/PageWrapper';
import Swal from 'sweetalert2';

interface LogEntry {
  id: number;
  username: string;
  method: string;
  action: string;
  result: string;
  details: string;
  ipAddress?: string;
  timestamp: string; // Assuming it comes as a string from API
}

export default function AdminLogsPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // Removed setPageSize as it's not used
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [filterUsername, setFilterUsername] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterResult, setFilterResult] = useState('');

  const handleSort = useCallback((column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
  }, [sortBy, sortOrder]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('pageSize', pageSize.toString());
      queryParams.append('sortBy', sortBy);
      queryParams.append('sortOrder', sortOrder);
      if (filterUsername) queryParams.append('username', filterUsername);
      if (filterAction) queryParams.append('action', filterAction);
      if (filterResult) queryParams.append('result', filterResult);

      const response = await fetch(`/api/logs?${queryParams.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch logs');
      }
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      Swal.fire({
        title: 'Error',
        text: err instanceof Error ? err.message : 'An unknown error occurred while fetching logs.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, sortOrder, filterUsername, filterAction, filterResult]); // Add all dependencies of fetchLogs

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

    const handler = setTimeout(() => {
      fetchLogs();
    }, 300); // Debounce fetchLogs to avoid excessive API calls

    return () => {
      clearTimeout(handler);
    };
  }, [isLoggedIn, user, router, fetchLogs, filterUsername, filterAction, filterResult]); // Add fetchLogs to useEffect dependencies

  if (!isLoggedIn || user?.role !== 'admin') {
    return null; // Render nothing while redirecting or showing alert
  }

  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.push('/admin')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
        >
          &larr; Back to Admin Panel
        </button>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-center text-gray-800">System Logs</h1>
        <div></div> {/* Spacer for alignment */}
      </div>

      {/* Filter Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end">
        <input
          type="text"
          placeholder="Filter by Username"
          className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          value={filterUsername}
          onChange={(e) => setFilterUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by Action"
          className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by Result"
          className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          value={filterResult}
          onChange={(e) => setFilterResult(e.target.value)}
        />
        <button
          onClick={() => {
            setFilterUsername('');
            setFilterAction('');
            setFilterResult('');
            setPage(1); // Reset page when clearing filters
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
        >
          Clear Filters
        </button>
      </div>

      {error && <div className="text-center text-red-500 text-xl mb-4">Error: {error}</div>}

      {loading ? (
        <div className="text-center text-gray-800 text-xl font-semibold">Loading logs...</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('id')}>ID {sortBy === 'id' && (sortOrder === 'ASC' ? '▲' : '▼')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('username')}>Username {sortBy === 'username' && (sortOrder === 'ASC' ? '▲' : '▼')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('method')}>Method {sortBy === 'method' && (sortOrder === 'ASC' ? '▲' : '▼')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('action')}>Action {sortBy === 'action' && (sortOrder === 'ASC' ? '▲' : '▼')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('result')}>Result {sortBy === 'result' && (sortOrder === 'ASC' ? '▲' : '▼')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('ipAddress')}>IP Address {sortBy === 'ipAddress' && (sortOrder === 'ASC' ? '▲' : '▼')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('timestamp')}>Timestamp {sortBy === 'timestamp' && (sortOrder === 'ASC' ? '▲' : '▼')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log, index) => (
                <tr key={log.id} className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                  <td data-label="ID" className="px-6 py-4 text-sm font-medium text-gray-900">{log.id}</td>
                  <td data-label="Username" className="px-6 py-4 text-sm text-gray-500">{log.username}</td>
                  <td data-label="Method" className="px-6 py-4 text-sm text-gray-500">{log.method}</td>
                  <td data-label="Action" className="px-6 py-4 text-sm text-gray-500">{log.action}</td>
                  <td data-label="Result" className="px-6 py-4 text-sm text-gray-500">{log.result}</td>
                  <td data-label="Details" className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{log.details}</td>
                  <td data-label="IP Address" className="px-6 py-4 text-sm text-gray-500">{log.ipAddress}</td>
                  <td data-label="Timestamp" className="px-6 py-4 text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage(prev => Math.max(1, prev - 1))}
          disabled={page === 1 || loading}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
        >
          Previous
        </button>
        <span className="text-gray-700 text-lg font-medium">Page {page}</span>
        <button
          onClick={() => setPage(prev => prev + 1)}
          disabled={logs.length < pageSize || loading}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
        >
          Next
        </button>
      </div>
    </PageWrapper>
  );
}
