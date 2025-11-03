'use client';
import { useState, useEffect, Suspense, lazy } from 'react';
import PageWrapper from '../../components/PageWrapper';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface Document {
  id: number;
  title: string;
  content: string;
}

const LazyDocumentForm = lazy(() => import('../../components/DocumentForm'));
const LazyDocumentList = lazy(() => import('../../components/DocumentList'));

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
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight mb-12 text-center text-gray-800">Documents</h1>

      <Suspense fallback={<div>Loading form...</div>}>
        <LazyDocumentForm
          newDocTitle={newDocTitle} setNewDocTitle={setNewDocTitle}
          newDocContent={newDocContent} setNewDocContent={setNewDocContent}
          editingDoc={editingDoc} setEditingDoc={setEditingDoc}
          handleAddDocument={handleAddDocument}
          handleUpdateDocument={handleUpdateDocument}
        />
      </Suspense>

      {error ? (
        <div className="text-center text-red-500 text-xl">{error}</div>
      ) : loading ? (
        <div className="text-center text-gray-800 text-xl font-semibold">Loading documents...</div>
      ) : (
        <Suspense fallback={<div>Loading documents...</div>}>
          <LazyDocumentList documents={documents} handleEditClick={handleEditClick} />
        </Suspense>
      )}
    </PageWrapper>
  );
}