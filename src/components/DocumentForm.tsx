'use client';

interface DocumentFormProps {
  newDocTitle: string;
  setNewDocTitle: (value: string) => void;
  newDocContent: string;
  setNewDocContent: (value: string) => void;
  editingDoc: { id: number; title: string; content: string } | null;
  handleAddDocument: (e: React.FormEvent) => Promise<void>;
  handleUpdateDocument: (e: React.FormEvent) => Promise<void>;
  setEditingDoc: (doc: { id: number; title: string; content: string } | null) => void;
}

export default function DocumentForm({
  newDocTitle, setNewDocTitle, newDocContent, setNewDocContent, editingDoc,
  handleAddDocument, handleUpdateDocument, setEditingDoc
}: DocumentFormProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">{editingDoc ? 'Edit Document' : 'Add New Document'}</h2>
      <form onSubmit={editingDoc ? handleUpdateDocument : handleAddDocument}>
        <div className="mb-4">
          <label htmlFor="docTitle" className="block text-gray-700 font-semibold mb-2">Title</label>
          <input
            type="text"
            id="docTitle"
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="docContent" className="block text-gray-700 font-semibold mb-2">Content</label>
          <textarea
            id="docContent"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="bg-gray-200 text-gray-800 py-2 px-4 shadow-lg hover:bg-gray-300 transition-colors"
            >
              Cancel Edit
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 shadow-lg hover:bg-blue-700 transition-colors"
          >
            {editingDoc ? 'Update Document' : 'Add Document'}
          </button>
        </div>
      </form>
    </div>
  );
}
