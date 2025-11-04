'use client';

import React from 'react';

interface Document {
  id: number;
  title: string;
  category: string;
  description: string;
  filePath: string;
}

interface DocumentPreviewModalProps {
  isOpen: boolean;
  document: Document | null;
  onClose: () => void;
  onEditClick: (doc: Document) => void;
}

export default function DocumentPreviewModal({ isOpen, document, onClose, onEditClick }: DocumentPreviewModalProps) {
  if (!isOpen || !document) return null;

  const isImage = document.filePath && document.filePath.match(/\.(jpeg|jpg|gif|png)$/) != null;
  const isPdf = document.filePath && document.filePath.match(/\.pdf$/) != null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full h-5/6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{document.title}</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => onEditClick(document)}
              className="bg-gray-200 text-gray-800 py-2 px-4 shadow-lg hover:bg-gray-300 transition-colors rounded-full flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>
              Edit
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">&times;</button>
          </div>
        </div>
        <div className="flex-grow mt-4" style={{ height: 'calc(100% - 50px)' }}>
          {isImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={document.filePath} alt="Document Preview" className="max-w-full max-h-full object-contain mx-auto" />
          )}
          {isPdf && (
            <embed src={document.filePath} type="application/pdf" width="100%" height="100%" />
          )}
          {!isImage && !isPdf && (
            <div className="text-center text-gray-600 text-lg">
              <p>No preview available for this file type.</p>
              <a href={document.filePath} download className="text-blue-600 hover:underline mt-2 block">Download to view</a>
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-gray-600 mb-2"><span className="font-semibold">Category:</span> {document.category}</p>
          <p className="text-gray-600 mb-4"><span className="font-semibold">Description:</span> {document.description}</p>
        </div>
      </div>
    </div>
  );
}
