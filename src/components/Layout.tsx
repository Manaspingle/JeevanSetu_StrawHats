import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { EmergencyBottomBar } from '@/components/ui/EmergencyBottomBar';

export default function Layout() {
  return (
    <div 
      className="min-h-screen flex flex-col transition-colors pb-16 md:pb-0"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-navy)' }}
    >
      <Navbar />
      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        <Outlet />
      </main>
      <footer 
        className="border-t py-6 text-center text-xs"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-navy)'
        }}
      >
        <p className="font-bold">
          JeevanSetu &bull; रक्ताचा सेतू, जीवनाचा आधार
        </p>
        <p className="text-[11px] opacity-75 mt-0.5">
          Action-First Clinical Blood Transfusion, Cold-Chain Safety &amp; Verified Donor Registry
        </p>
      </footer>
      <EmergencyBottomBar />
    </div>
  );
}
