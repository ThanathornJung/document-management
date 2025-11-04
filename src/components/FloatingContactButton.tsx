'use client';
import Link from 'next/link';
import React from 'react';

export default function FloatingContactButton() {
  return (
    <div className="fixed bottom-8 right-8 z-40">
      <Link href="/contact">
        <button className="bg-blue-600 text-white py-3 px-6 shadow-lg hover:bg-blue-700 transition-colors transform hover:scale-105">
          Contact Us
        </button>
      </Link>
    </div>
  );
}
