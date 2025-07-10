// /pages/_app.js
import '@/styles/globals.css';
import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import '@/styles/print.css';
import '@/styles/branded-print.css';
import { AppProvider } from '@/context/AppContext';
import InactivityTimeout from '@/components/InactivityTimeout';


import Layout from '@/components/Layout';

const allowedRoutesForCashier = ['/sales', '/sales/list', '/sales/return'];

function ProtectedLayout({ Component, pageProps }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isPOSPage = router.pathname === '/sales';
  const isLoginPage = router.pathname === '/login';

  console.log('Current Pathname:', router.pathname);
  console.log('Is POS Page:', isPOSPage);

  if (status === 'loading') {
    return <div className="p-4">Loading...</div>;
  }

  if (!session && !isLoginPage) {
    if (typeof window !== 'undefined') {
      router.push('/login?message=session_expired');
    }
    return <div className="p-4">Your session has expired. Redirecting to login...</div>;
  }

  // Restrict cashier access
  if (session?.user?.role === 'cashier' && !allowedRoutesForCashier.includes(router.pathname)) {
    if (typeof window !== 'undefined') {
      router.push('/sales');
    }
    return <div className="p-4">Access Denied. Redirecting...</div>;
  }

  return !isLoginPage ? (
    <Layout isPOSPage={isPOSPage}>
      <Component {...pageProps} />
    </Layout>
  ) : (
    <Component {...pageProps} />
  );
}

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <AppProvider>
        <InactivityTimeout />
        <ProtectedLayout Component={Component} pageProps={pageProps} />
      </AppProvider>
    </SessionProvider>
  );
}
