/**
 * The main header for the application.
 * Contains the logo and navigation links.
 */
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = () => {
    logout();
    router.push('/login');
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex-shrink-0">
          <div className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
            <Link href="/">Document Management</Link>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center space-x-4">
          {isLoggedIn && user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                {user.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt="Profile Picture"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <span className="text-gray-800 font-semibold text-sm">{user.username}</span>
                <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                  <Link href="/my-info">
                    <button onClick={() => setIsProfileMenuOpen(false)} className="block w-full text-left px-4 py-2 text-sm text-gray-800 font-semibold hover:bg-gray-100">
                      My Info
                    </button>
                  </Link>
                  <Link href="/documents">
                    <button onClick={() => setIsProfileMenuOpen(false)} className="block w-full text-left px-4 py-2 text-sm text-gray-800 font-semibold hover:bg-gray-100">
                      My Documents
                    </button>
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-800 font-semibold hover:bg-gray-100">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-4">
              <Link href="/register" className="font-semibold text-gray-600 hover:text-blue-600">Register</Link>
              <Link href="/login" className="font-semibold text-gray-600 hover:text-blue-600">Login</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="sm:hidden flex items-center space-x-4">
          {isLoggedIn && user && (
            <div className="relative">
              {user.profilePicture ? (
                <Image
                  src={user.profilePicture}
                  alt="Profile Picture"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          )}
          <button onClick={toggleSidebar} className="text-gray-800 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}



