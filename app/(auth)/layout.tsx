export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-gray-50 text-gray-900">{children}</div>;
}
