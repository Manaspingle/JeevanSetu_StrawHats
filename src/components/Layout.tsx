import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />
      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 bg-white dark:bg-slate-900 text-center text-xs text-slate-500">
        <p>
          <strong>JeevanSetu</strong> &bull; रक्ताचा सेतू, जीवनाचा आधार &bull; National Blood Transfusion Network &bull; Govt of India
        </p>
      </footer>
    </div>
  );
}
