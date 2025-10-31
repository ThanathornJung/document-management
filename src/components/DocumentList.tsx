'use client';

interface Document {
  id: number;
  title: string;
  content: string;
}

interface DocumentListProps {
  documents: Document[];
  handleEditClick: (doc: Document) => void;
}

export default function DocumentList({ documents, handleEditClick }: DocumentListProps) {
  return (
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
  );
}
