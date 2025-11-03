/**
 * The Contact Us page.
 * Displays a contact form.
 */
'use client';
import PageWrapper from '../../components/PageWrapper'; // Import PageWrapper
// import { motion } from 'framer-motion'; // Removed motion import

export default function Contact() {
  return (
    <PageWrapper> {/* Use PageWrapper here */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight mb-4 text-center text-gray-800">Contact Us</h1>
      <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto text-center">
        We&apos;d love to hear from you. Send us a message and we&apos;ll get back to you as soon as possible.
      </p>
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-lg mx-auto">
        <form>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Name</label>
            <input type="text" id="name" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Email</label>
            <input type="email" id="email" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">Message</label>
            <textarea id="message" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white py-3 px-8 shadow-lg hover:bg-blue-700 transition-colors w-full"
          >
            Send Message
          </button>
        </form>
      </div>
    </PageWrapper>
  );
}
