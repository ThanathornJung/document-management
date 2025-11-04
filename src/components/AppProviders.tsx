'use client';
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar'; // Import Sidebar
import { AuthProvider } from '../context/AuthContext'; // Import AuthProvider


import LoadingModal from './LoadingModal';

interface AppProvidersProps {
  children: React.ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDbConnecting, setIsDbConnecting] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const testDbConnection = async () => {
      try {
        await fetch('/api/test-db-connection');
      } catch (error) {
        console.error('Failed to connect to the database:', error);
      } finally {
        setIsDbConnecting(false);
      }
    };
    testDbConnection();
  }, []);

  return (
    <AuthProvider>
      <LoadingModal isOpen={isDbConnecting} message="Connecting to database..." />
      <div className="min-h-screen flex flex-col">
        <Header toggleSidebar={toggleSidebar} />
        <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} /> {/* Pass user prop */}
        {isSidebarOpen && ( // Overlay when sidebar is open
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}
        <main className="pt-20 flex-grow">{children}</main>
        <footer className="bg-gray-900 bg-opacity-75 py-8">
          <div className="container mx-auto px-6 text-center text-white">
            <p>&copy; 2024 Document Management. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
