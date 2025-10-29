import './globals.css';
import AppProviders from '../components/AppProviders';

// metadata can be exported from a server component layout
export const metadata = {
  title: 'Document Management',
  description: 'A modern document management system.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}












