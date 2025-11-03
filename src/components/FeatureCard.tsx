/**
 * A reusable component to display a feature card with an icon, title, and description.
 */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export default function FeatureCard({ icon, title, children }: FeatureCardProps) {
  return (
    <div className="text-center bg-white p-6 rounded-lg shadow-lg">
      <div className="text-5xl text-blue-600 mb-4">{icon}</div>
      <h3 className="text-2xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{children}</p>
    </div>
  );
}
