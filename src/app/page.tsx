/**
 * The main home page of the application.
 * Displays a hero section and a features section.
 */
'use client';
// 
import FeatureCard from '../components/FeatureCard';
import PageWrapper from '../components/PageWrapper'; // Import PageWrapper
import FloatingContactButton from '../components/FloatingContactButton'; // Import FloatingContactButton

export default function Home() {
  return (
    <PageWrapper> {/* Use PageWrapper here */}
      <section
        className="text-center"
      >
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold leading-tight mb-4 text-gray-800">
          Modern Document Management
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          A new way to manage your documents. Secure, efficient, and beautiful.
        </p>
      </section>

      <section
        className="bg-gray-100 py-16 sm:py-20"
      >
        <div className="container mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-12 text-gray-800">Features</h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <FeatureCard icon="✓" title="Secure">
              Your documents are safe with us. We use the latest security
              technologies to protect your data.
            </FeatureCard>
            <FeatureCard icon="✓" title="Efficient">
              Manage your documents with ease. Our intuitive interface makes it
              simple to organize and find your files.
            </FeatureCard>
            <FeatureCard icon="✓" title="Beautiful">
              A modern and attractive interface that you&apos;ll love to use.
            </FeatureCard>
          </div>
        </div>
      </section>
      <FloatingContactButton /> {/* Add the floating contact button */}
    </PageWrapper>
  );
}

