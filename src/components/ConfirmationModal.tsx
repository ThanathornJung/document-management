'use client';
import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 border-4 border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="bg-gray-200 text-gray-800 py-2 px-4 shadow-lg hover:bg-gray-300 transition-colors rounded-full"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white py-2 px-4 shadow-lg hover:bg-red-700 transition-colors rounded-full"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
