import { type ReactNode } from 'react';
import BrandHeader from './BrandHeader';
import BrandFooter from './BrandFooter';

interface BrandLayoutProps {
  children: ReactNode;
}

export default function BrandLayout({ children }: BrandLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BrandHeader />
      <main className="flex-1">
        {children}
      </main>
      <BrandFooter />
    </div>
  );
}

