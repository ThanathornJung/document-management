'use client';
import { useState, useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import PageWrapper from '../../../components/PageWrapper';
import Swal from 'sweetalert2';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { Document } from '../../../lib/db'; // Import shared Document interface

const LazyDocumentList = lazy(() => import('../../../components/DocumentList'));
const EditDocumentModal = lazy(() => import('../../../components/EditDocumentModal'));
const DocumentPreviewModal = lazy(() => import('../../../components/DocumentPreviewModal'));

export default function AdminDocumentsPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // Default to list view for admin
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [documentToDeleteId, setDocumentToDeleteId] = useState<number | null>(null);

  const categories = [
    "All",
    "Citizen ID",
    "Driver's License",
    "Military Certificate",
    "Passport",
    "Other",
  ];

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'admin') {
      Swal.fire({
        title: 'Unauthorized',
        text: 'You do not have permission to view this page.',
        icon: 'error',
        confirmButtonText: 'OK'
      }).then(() => {
        router.push('/');
      });
      return;
    }

    fetchDocuments();
  }, [isLoggedIn, user, router, selectedCategory, searchTerm]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/documents?all=true'); // Fetch all documents for admin
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching documents.');
      Swal.fire({
        title: 'Error',
        text: err instanceof Error ? err.message : 'An unknown error occurred while fetching documents.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let currentDocuments = documents;

    if (selectedCategory !== 'All') {
      currentDocuments = currentDocuments.filter(doc => doc.category === selectedCategory);
    }

    if (searchTerm) {
      currentDocuments = currentDocuments.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.username && doc.username.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredDocuments(currentDocuments);
  }, [selectedCategory, documents, searchTerm]);

  const handleEditClick = (doc: Document) => {
    setIsPreviewModalOpen(false);
    setEditingDocument(doc);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = (updatedDoc?: Document) => {
    setIsEditModalOpen(false);
    const docToShow = updatedDoc || editingDocument;
    if (docToShow) {
      setViewingDocument(docToShow);
      setIsPreviewModalOpen(true);
    }
    setEditingDocument(null);
  };

  const handleUpdateDocument = async (id: number, data: { category: string; description: string; file?: File; newFileName?: string }) => {
    try {
      let response;
      if (data.file) {
        const formData = new FormData();
        formData.append('id', id.toString());
        formData.append('category', data.category);
        formData.append('description', data.description);
        if (data.newFileName) {
          formData.append('newFileName', data.newFileName);
        }
        formData.append('file', data.file);

        response = await fetch(`/api/documents`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        response = await fetch(`/api/documents`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, category: data.category, description: data.description, newFileName: data.newFileName }),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to update document');
      }
      const result = await response.json();
      fetchDocuments(); // Re-fetch to get the updated list
      return result.document;
    } catch (error) {
      console.error('Error updating document:', error);
      setError('Failed to update document. Please try again.');
    }
  };

  const handleDeleteDocument = async (id: number) => {
    setDocumentToDeleteId(id);
    setIsConfirmModalOpen(true);
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setDocumentToDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (documentToDeleteId === null) return;

    try {
      const response = await fetch(`/api/documents?id=${documentToDeleteId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      fetchDocuments(); // Re-fetch to get the updated list
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document. Please try again.');
    } finally {
      setIsConfirmModalOpen(false);
      setDocumentToDeleteId(null);
    }
  };

  const handleViewClick = (doc: Document) => {
    setViewingDocument(doc);
    setIsPreviewModalOpen(true);
  };

  const handleClosePreviewModal = () => {
    setViewingDocument(null);
    setIsPreviewModalOpen(false);
  };

  if (!isLoggedIn || user?.role !== 'admin') {
    return null; // Render nothing while redirecting or showing alert
  }

  return (
    <PageWrapper>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-8 text-center text-gray-800">Manage All Documents</h1>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <div className="flex items-center border border-gray-300 rounded-lg p-1 bg-white">
            <button onClick={() => setViewMode('grid')} className={`p-1 rounded-md ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1 rounded-md ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <label htmlFor="categoryFilter" className="sr-only">Filter by Category</label>
        <select
          id="categoryFilter"
          className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="text-center text-red-500 text-xl">Error: {error}</div>
      ) : loading ? (
        <div className="text-center text-gray-800 text-xl font-semibold">Loading documents...</div>
      ) : (
        <Suspense fallback={<div>Loading documents...</div>}>
          <LazyDocumentList
            documents={filteredDocuments}
            viewMode={viewMode}
            onDeleteClick={handleDeleteDocument}
            onViewClick={handleViewClick}
          />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <EditDocumentModal
          key={editingDocument?.id}
          isOpen={isEditModalOpen}
          document={editingDocument}
          onClose={handleCloseModal}
          onSave={handleUpdateDocument}
        />
        <DocumentPreviewModal
          isOpen={isPreviewModalOpen}
          document={viewingDocument}
          onClose={handleClosePreviewModal}
          onEditClick={handleEditClick}
        />
      </Suspense>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this document? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </PageWrapper>
  );
}
