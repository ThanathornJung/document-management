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
    <header className="fixed top-0 left-0 right-0 z-10 bg-gray-900 bg-opacity-75 shadow-lg">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex-shrink-0">
          <div className="text-xl sm:text-2xl font-press-start text-yellow-400">
            <Link href="/">Document Management</Link>
          </div>
        </div>

        {/* Left: Menu Bar (Desktop) */}
        <nav className="hidden sm:flex items-center space-x-8"> {/* This hides desktop nav on mobile */}
          {isLoggedIn && (
            <>
              <Link
                href="/documents"
                className="font-press-start text-white hover:text-yellow-400"
              >
                Documents
              </Link>
              
            </>
          )}
        </nav>

        {/* Right: Logo and User Profile / Register/Login */}
        <div className="flex items-center space-x-4 hidden sm:flex"> {/* Combined Logo and User Profile, hidden on mobile */}
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
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-yellow-400">
                  <Link href="/my-info">
                    <button onClick={() => setIsProfileMenuOpen(false)} className="block w-full text-left px-4 py-2 text-sm text-white font-press-start hover:bg-gray-700">
                      My Info
                    </button>
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-white font-press-start hover:bg-gray-700">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-4"> {/* Show Register/Login if not logged in */}
              <Link
                href="/register"
                className="font-press-start text-white hover:text-yellow-400"
              >
                Register
              </Link>
              <Link
                href="/login"
                className="font-press-start text-white hover:text-yellow-400"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        {/* Hamburger menu for mobile (moved to right) */}
        <div className="sm:hidden">
          <button onClick={toggleSidebar} className="text-white focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}



