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
  );
}
