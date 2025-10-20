'use client';

import Footer from '@/components/Footer';
import { usePathname } from 'next/navigation';

export default function FooterWrapper() {
  const pathname = usePathname();
  const hideOnMobile = pathname === '/' || pathname === '/signin';

  return (
    <div className={hideOnMobile ? 'hidden sm:block' : ''}>
      <Footer />
    </div>
  );
}


