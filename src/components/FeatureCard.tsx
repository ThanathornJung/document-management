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
    <div className="text-center bg-gray-800 bg-opacity-75 p-6 rounded-lg shadow-lg">
      <div className="text-5xl text-yellow-400 mb-4">{icon}</div>
      <h3 className="text-2xl font-press-start mb-2 text-white">{title}</h3>
      <p className="text-gray-300">{children}</p>
    </div>
  );
}
