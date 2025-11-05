'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import PageWrapper from '../../../components/PageWrapper';

const DynamicDocumentUploadForm = dynamic(() => import('../../../components/DocumentUploadForm'), {
  loading: () => <p>Loading form...</p>,
  ssr: false, // Ensure it's client-side rendered
});

export default function UploadDocumentPage() {

  return (
    <PageWrapper>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-12 text-center text-gray-800">Upload Document</h1>
      <DynamicDocumentUploadForm />
    </PageWrapper>
  );
}

