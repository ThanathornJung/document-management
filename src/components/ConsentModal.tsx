'use client';
import React from 'react';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  children: React.ReactNode;
}

export default function ConsentModal({ isOpen, onClose, onAccept, children }: ConsentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl w-full mx-4 border-4 border-yellow-400">
        <h2 className="text-2xl font-press-start text-yellow-400 mb-4">Terms and Conditions</h2>
        <div className="text-white text-sm h-64 overflow-y-auto mb-6 pr-2 custom-scrollbar-style">
          {children}
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white font-press-start py-2 px-4 shadow-lg hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onAccept}
            className="bg-yellow-500 text-gray-900 font-press-start py-2 px-4 shadow-lg hover:bg-yellow-400 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
      
    </div>
  );
}
