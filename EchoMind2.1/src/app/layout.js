import './globals.css';

export const metadata = {
  title: 'EchoMind 2.1',
  description: 'Magic Photo Gallery with Voice Control',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 