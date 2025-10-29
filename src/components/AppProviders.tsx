'use client';
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar'; // Import Sidebar
import { AuthProvider } from '../context/AuthContext'; // Import AuthProvider


interface AppProvidersProps {
  children: React.ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <AuthProvider>
      <Header />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} /> {/* Render Sidebar */}
      {isSidebarOpen && ( // Overlay when sidebar is open
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <main className="pt-16 flex-grow">{children}</main>
      <footer className="bg-gray-900 bg-opacity-75 py-8 mt-12">
        <div className="container mx-auto px-6 text-center text-white">
          <p className="font-press-start">&copy; 2024 Document Management. All rights reserved.</p>
        </div>
      </footer>
    </AuthProvider>
  );
}
