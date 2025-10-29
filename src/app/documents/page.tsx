'use client';
import { useState, useEffect } from 'react';
import PageWrapper from '../../components/PageWrapper';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface Document {
  id: number;
  title: string;
  content: string;
}

export default function DocumentsPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  const [editingDoc, setEditingDoc] = useState<Document | null>(null); // State for document being edited

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    fetchDocuments();
  }, [isLoggedIn, router]);

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle || !newDocContent) {
      alert('Title and Content cannot be empty!');
      return;
    }

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newDocTitle, content: newDocContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create document');
      }

      setNewDocTitle('');
      setNewDocContent('');
      fetchDocuments(); // Re-fetch documents after adding
    } catch (err) {
      console.error('Error adding document:', err);
      alert('Failed to add document: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleEditClick = (doc: Document) => {
    setEditingDoc(doc);
    setNewDocTitle(doc.title);
    setNewDocContent(doc.content);
  };

  const handleUpdateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc || !newDocTitle || !newDocContent) {
      alert('Title and Content cannot be empty!');
      return;
    }

    try {
      const response = await fetch('/api/documents', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: editingDoc.id, title: newDocTitle, content: newDocContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update document');
      }

      setEditingDoc(null);
      setNewDocTitle('');
      setNewDocContent('');
      fetchDocuments(); // Re-fetch documents after updating
    } catch (err) {
      console.error('Error updating document:', err);
      alert('Failed to update document: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <PageWrapper>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-press-start leading-tight mb-12 text-center text-yellow-400">Documents</h1>

      {/* Add/Edit Document Form */}
      <div className="bg-gray-800 bg-opacity-75 p-6 rounded-lg shadow-lg mb-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-press-start text-yellow-400 mb-4">{editingDoc ? 'Edit Document' : 'Add New Document'}</h2>
        <form onSubmit={editingDoc ? handleUpdateDocument : handleAddDocument}>
          <div className="mb-4">
            <label htmlFor="docTitle" className="block text-white font-press-start mb-2">Title</label>
            <input
              type="text"
              id="docTitle"
              className="w-full px-3 py-2 border border-gray-600 rounded-none bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="docContent" className="block text-white font-press-start mb-2">Content</label>
            <textarea
              id="docContent"
              rows={4}
              className="w-full px-3 py-2 border border-gray-600 rounded-none bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={newDocContent}
              onChange={(e) => setNewDocContent(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="flex justify-end space-x-4">
            {editingDoc && (
              <button
                type="button"
                onClick={() => { setEditingDoc(null); setNewDocTitle(''); setNewDocContent(''); }}
                className="bg-gray-600 text-white font-press-start py-2 px-4 shadow-lg hover:bg-gray-500 transition-colors"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              className="bg-yellow-500 text-gray-900 font-press-start py-2 px-4 shadow-lg hover:bg-yellow-400 transition-colors"
            >
              {editingDoc ? 'Update Document' : 'Add Document'}
            </button>
          </div>
        </form>
      </div>

      {error ? (
        <div className="text-center text-red-500 text-xl">{error}</div>
      ) : loading ? (
        <div className="text-center text-white text-xl font-press-start">Loading documents...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-gray-800 bg-opacity-75 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-press-start mb-2 text-yellow-400">{doc.title}</h2>
              <p className="text-gray-300 mb-4">{doc.content}</p>
              <button
                onClick={() => handleEditClick(doc)}
                className="bg-blue-500 text-white font-press-start py-1 px-3 text-sm shadow-lg hover:bg-blue-400 transition-colors"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
