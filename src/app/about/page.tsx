/**
 * The About Us page.
 * Displays information about the company and the team.
 */
'use client';
import PageWrapper from '../../components/PageWrapper'; // Import PageWrapper

export default function About() {
  return (
    <PageWrapper> {/* Use PageWrapper here */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight mb-4 text-center text-gray-800">About Us</h1>
      <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto text-center">
        We are a team of passionate developers dedicated to creating beautiful and functional software.
      </p>
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-gray-800">Our Mission</h2>
        <p className="text-gray-600 mb-4">
          Our mission is to provide the best document management solution on the market. We believe that software should be easy to use, secure, and affordable.
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-gray-800">Our Team</h2>
        <p className="text-gray-600">
          We are a small but dedicated team of engineers, designers, and product managers. We are passionate about what we do and we are always looking for new challenges.
        </p>
      </div>
    </PageWrapper>
  );
}
