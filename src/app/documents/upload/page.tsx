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
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight mb-12 text-center text-gray-800">Upload Document</h1>
      <DynamicDocumentUploadForm />
    </PageWrapper>
  );
}

