import "./globals.css";
import AppToaster from "@/components/AppToaster";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
