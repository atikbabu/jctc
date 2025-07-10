// pages/sales.js (Optional redirect to POS or dashboard)
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SalesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/sales/index'); // or '/sales/pos' if POS is separated
  }, [router]);

  return null;
}
