'use client';

import Link from "next/link";
import { memo } from 'react';
import Image from 'next/image'; // Import Image component
import { Document } from '@/lib/db'; // Import shared Document interface

interface DocumentListProps {
  documents: Document[];
  viewMode: 'grid' | 'list';
  onDeleteClick: (id: number) => void;
  onViewClick: (doc: Document) => void;
}

const FileIcon = ({ filePath }: { filePath: string }) => {
  const isImage = filePath.match(/\.(jpeg|jpg|gif|png)$/) != null;
  const isPdf = filePath.match(/\.pdf$/) != null;

  if (isImage) {
    return (
      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14" /></svg>
    );
  }

  if (isPdf) {
    return (
      <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm3 4a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h4a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
    );
  }

  return (
    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
  );
};

const DownloadIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
);

const DeleteIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

const PreviewIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);

const GridView = ({ documents, onDeleteClick, onViewClick }: { documents: Document[], onDeleteClick: (id: number) => void, onViewClick: (doc: Document) => void }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {documents.map((doc) => (
      <div key={doc.id} className="bg-white border border-gray-200 rounded-lg shadow-md flex flex-col transition-all duration-300 hover:shadow-xl">
        {doc.filePath.match(/\.(jpeg|jpg|gif|png)$/) != null && (
          <div className="mb-4 relative w-full h-48">
            <Image src={doc.filePath} alt={doc.title} fill style={{ objectFit: 'cover' }} className="rounded-t-lg" />
          </div>
        )}
        <div className="p-4 flex-grow">
          <div className="flex items-center mb-2">
            <FileIcon filePath={doc.filePath} />
            <h2 className="text-base font-semibold ml-3 text-gray-800 truncate">{doc.title}</h2>
          </div>
          <p className="text-sm text-gray-600 mb-2"><span className="font-semibold">Category:</span> {doc.category}</p>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2"><span className="font-semibold">Description:</span> {doc.description}</p>
        </div>
        <div className="p-4 pt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <a
            href={doc.filePath}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white text-center py-2 px-3 shadow-lg hover:bg-blue-600 transition-colors rounded-full flex items-center justify-center text-sm"
          >
            <DownloadIcon />
            Download
          </a>
          <button
            onClick={() => onDeleteClick(doc.id)}
            className="bg-red-500 text-white text-center py-2 px-3 shadow-lg hover:bg-red-600 transition-colors rounded-full flex items-center justify-center text-sm"
          >
            <DeleteIcon />
            Delete
          </button>
          <button
            onClick={() => onViewClick(doc)}
            className="bg-green-500 text-white text-center py-2 px-3 shadow-lg hover:bg-green-600 transition-colors rounded-full flex items-center justify-center text-sm"
          >
            <PreviewIcon />
            View
          </button>
        </div>
      </div>
    ))}
  </div>
);

const ListView = ({ documents, onDeleteClick, onViewClick }: { documents: Document[], onDeleteClick: (id: number) => void, onViewClick: (doc: Document) => void }) => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-x-auto">
    <table className="w-full responsive-table">
      <thead>
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200 md:divide-y-0">
        {documents.map((doc) => (
          <tr key={doc.id} className="hover:bg-gray-50">
            <td data-label="File" className="px-6 py-4">
              <div className="flex items-center">
                <FileIcon filePath={doc.filePath} />
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                </div>
              </div>
            </td>
            <td data-label="Category" className="px-6 py-4 text-sm text-gray-500">{doc.category}</td>
            <td data-label="Description" className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{doc.description}</td>
            <td data-label="Actions" className="px-6 py-4 text-right text-sm font-medium space-x-4">
              <a href={doc.filePath} download target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900">Download</a>
              <button onClick={() => onDeleteClick(doc.id)} className="text-red-600 hover:text-red-900">Delete</button>
              <button onClick={() => onViewClick(doc)} className="text-green-600 hover:text-green-900">View</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const DocumentList = memo(({ documents, viewMode, onDeleteClick, onViewClick }: DocumentListProps) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">No documents yet</h2>
        <p className="text-gray-500 mb-8">Get started by uploading your first document.</p>
        <Link href="/documents/upload" className="bg-blue-600 text-white py-3 px-6 shadow-lg hover:bg-blue-700 transition-colors rounded-full text-lg font-semibold">
          Upload Document
        </Link>
      </div>
    );
  }

  return viewMode === 'grid' ? <GridView documents={documents} onDeleteClick={onDeleteClick} onViewClick={onViewClick} /> : <ListView documents={documents} onDeleteClick={onDeleteClick} onViewClick={onViewClick} />;
});

DocumentList.displayName = 'DocumentList';

export default DocumentList;