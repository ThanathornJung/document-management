'use client';
import React from 'react';

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export default function LoadingModal({ isOpen, message = "Loading..." }: LoadingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-xs w-full mx-4 border-4 border-yellow-400 text-center">
        <p className="text-white font-press-start text-lg">{message}</p>
        {/* You can add a spinner here if you have an SVG or component for it */}
        <div className="mt-4 animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-500 mx-auto"></div>
      </div>
    </div>
  );
}
