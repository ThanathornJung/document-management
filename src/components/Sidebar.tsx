'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Import Image

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isLoggedIn, logout, user } = useAuth(); // Get user from AuthContext
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
    onClose(); // Close sidebar on logout
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-gray-900 bg-opacity-95 shadow-lg z-50 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out`}>
      <div className="p-4 flex justify-between items-center border-b border-yellow-400">
        <h2 className="text-xl font-press-start text-yellow-400">Menu</h2>
        <button onClick={onClose} className="text-white focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav className="flex flex-col p-4 space-y-2">
        {isLoggedIn && user ? (
          <>
            {/* User Profile at the top */}
            <div className="flex items-center space-x-2 mb-4 px-4 py-2 bg-gray-800 rounded">
              {user.profilePicture ? (
                <Image
                  src={user.profilePicture}
                  alt="Profile Picture"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full border-2 border-yellow-400"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center border-2 border-yellow-400">
                  <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <span className="text-white font-press-start text-sm">{user.username}</span>
            </div>
            <Link
              href="/"
              className="block px-4 py-2 text-white font-press-start hover:bg-gray-700 rounded"
              onClick={onClose}
            >
              Home
            </Link>
            <Link
              href="/my-info"
              className="block px-4 py-2 text-white font-press-start hover:bg-gray-700 rounded"
              onClick={onClose}
            >
              My Info
            </Link>
            <Link
              href="/documents"
              className="block px-4 py-2 text-white font-press-start hover:bg-gray-700 rounded"
              onClick={onClose}
            >
              Documents
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-white font-press-start hover:bg-gray-700 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/"
              className="block px-4 py-2 text-white font-press-start hover:bg-gray-700 rounded"
              onClick={onClose}
            >
              Home
            </Link>
            <Link
              href="/register"
              className="block px-4 py-2 text-white font-press-start hover:bg-gray-700 rounded"
              onClick={onClose}
            >
              Register
            </Link>
            <Link
              href="/login"
              className="block px-4 py-2 text-white font-press-start hover:bg-gray-700 rounded"
              onClick={onClose}
            >
              Login
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}

