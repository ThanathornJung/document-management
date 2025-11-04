'use client';

import React, { useState } from 'react';

interface Document {
  id: number;
  title: string;
  category: string;
  description: string;
  filePath: string;
}

interface EditDocumentModalProps {
  isOpen: boolean;
  document: Document | null;
  onClose: (updatedDoc?: Document) => void;
  onSave: (id: number, data: { category: string; description: string; file?: File; newFileName?: string }) => Promise<Document | undefined>;
}

const categories = [
  "Citizen ID",
  "Driver's License",
  "Military Certificate",
  "Passport",
  "Other",
];

export default function EditDocumentModal({ isOpen, document, onClose, onSave }: EditDocumentModalProps) {
  const [category, setCategory] = useState(document?.category ?? '');
  const [description, setDescription] = useState(document?.description ?? '');
  const [newFileName, setNewFileName] = useState(document?.title ?? '');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !document) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fileInput = e.currentTarget.elements.namedItem('file') as HTMLInputElement;
    const file = fileInput.files?.[0];
    const updatedDoc = await onSave(document.id, { category, description, file, newFileName });
    setLoading(false);
    onClose(updatedDoc);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full mx-4 border border-gray-200">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Edit Document</h2>
        <form key={document.id} onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="category" className="block text-gray-700 font-semibold mb-2">Category</label>
            <select
              id="category"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">Description</label>
            <textarea
              id="description"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a short description for your document..."
            ></textarea>
          </div>
          <div className="mb-6">
            <label htmlFor="newFileName" className="block text-gray-700 font-semibold mb-2">New File Name (Optional)</label>
            <input
              type="text"
              id="newFileName"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="file" className="block text-gray-700 font-semibold mb-2">Upload New File (Optional)</label>
            <input
              type="file"
              id="file"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setNewFileName(e.target.files[0].name);
                }
              }}
            />
            <p className="text-sm text-gray-500 mt-2">If you upload a new file, it will replace the existing one.</p>
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => onClose(document)}
              className="bg-gray-200 text-gray-800 py-3 px-6 shadow-lg hover:bg-gray-300 transition-colors rounded-lg text-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white py-3 px-6 shadow-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 rounded-lg text-lg font-semibold"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
