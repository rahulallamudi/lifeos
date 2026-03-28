export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">{title}</h1>
      {subtitle && (
        <p className="text-gray-600 mb-6">{subtitle}</p>
      )}
    </div>
  );
}
