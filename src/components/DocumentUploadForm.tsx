import React, { useState, DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Import Image component
import Swal from 'sweetalert2'; // Import SweetAlert2

const categories = [
  "Citizen ID",
  "Driver's License",
  "Military Certificate",
  "Passport",
  "Other",
];

const UploadIcon = () => (
  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v5a4 4 0 01-4 4H7z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v6m0 0l-3-3m3 3l3-3" /></svg>
);

export default function DocumentUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState<string>(categories[0]);
  const [description, setDescription] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const router = useRouter();

  const handleFile = (selectedFile: File | null) => {
    setFile(selectedFile);

    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }

    if (selectedFile) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
      setFileName(selectedFile.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] || null);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // This is necessary to allow dropping
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0] || null;
    handleFile(droppedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      Swal.fire({
        title: 'Error!',
        text: 'Please select a file to upload.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('title', fileName);

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload document');
      }

      Swal.fire({
        title: 'Success!',
        text: 'Document uploaded successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        router.push('/documents');
      });

    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'An unknown error occurred',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto border border-gray-200">
      <form onSubmit={handleSubmit}>
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-300 ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileUpload')?.click()}
        >
          <input
            type="file"
            id="fileUpload"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center">
            <UploadIcon />
            <p className="mt-4 text-lg text-gray-600">Drag & drop your file here, or <span className="font-semibold text-blue-600">click to browse</span></p>
            <p className="mt-1 text-sm text-gray-500">Supports: PDF, JPG, PNG</p>
          </div>
        </div>

        {(preview || file) && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Preview & Details</h3>
            {preview && (
              <div className="mb-4 relative w-full" style={{ height: '500px' }}> {/* Added relative and height for Image fill */}
                {file?.type.startsWith('image/') ? (
                  <Image src={preview} alt="Document Preview" fill style={{ objectFit: 'contain' }} className="rounded-lg" />
                ) : (
                  <embed src={preview} type={file?.type} width="100%" height="500px" />
                )}
              </div>
            )}
            {file && !preview && (
              <div className="mb-4 p-4 bg-gray-100 rounded-lg text-gray-700">
                <p><span className="font-semibold">Selected file:</span> {file.name}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fileName" className="block text-gray-700 font-semibold mb-2">File Name</label>
            <input
              type="text"
              id="fileName"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>
          <div>
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
          <div className="md:col-span-2">
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
        </div>

        <div className="mt-8 flex justify-between items-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-800 py-3 px-8 shadow-lg hover:bg-gray-300 transition-colors rounded-lg text-lg font-semibold"
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white py-3 px-8 shadow-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 rounded-lg text-lg font-semibold"
            disabled={loading || !file}
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </form>
    </div>
  );
}