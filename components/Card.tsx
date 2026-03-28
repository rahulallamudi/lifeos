export default function Card({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white text-black rounded-xl p-5 shadow-md mb-6">
      {children}
    </div>
  );
}
