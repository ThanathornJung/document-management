import { memo } from 'react';

/**
 * A reusable component to display a feature card with an icon, title, and description.
 */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const FeatureCard = memo(function FeatureCard({ icon, title, children }: FeatureCardProps) {
  return (
    <div className="text-center bg-white p-6 rounded-lg shadow-lg">
      <div className="text-4xl sm:text-5xl text-blue-600 mb-4">{icon}</div>
      <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{children}</p>
    </div>
  );
});

export default FeatureCard;
