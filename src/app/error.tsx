'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 text-rose-900 p-4">
      <h2 className="text-3xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-lg mb-4">We&apos;re sorry for the inconvenience. Please try again later.</p>
      <button
        className="bg-rose-500 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-rose-600 transition-colors"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
      {error && (
        <details className="mt-4 p-4 bg-rose-200 rounded-lg text-sm text-left w-full max-w-lg">
          <summary className="font-bold cursor-pointer">Error Details</summary>
          <pre className="mt-2 whitespace-pre-wrap break-words">
            {error.message}
            <br />
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}
