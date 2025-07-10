
import { useEffect, useState, useCallback, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const InactivityTimeout = ({ timeout = 600000 }) => { // Default to 10 minutes
  const { data: session, status } = useSession();
  const router = useRouter();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const intervalRef = useRef(null);

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: '/login?message=inactive', redirect: false }).then(() => {
        router.push('/login?message=inactive');
    });
  }, [router]);

  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      resetTimer(); // Reset timer immediately upon authentication
      const events = ['mousemove', 'keydown', 'click', 'scroll'];
      events.forEach(event => window.addEventListener(event, resetTimer));

      intervalRef.current = setInterval(() => {
        if (Date.now() - lastActivity > timeout) {
          handleSignOut();
        }
      }, 1000);
    } else {
      // If not authenticated, clear any existing timers and event listeners
      const events = ['mousemove', 'keydown', 'click', 'scroll'];
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      const events = ['mousemove', 'keydown', 'click', 'scroll'];
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, lastActivity, timeout, handleSignOut, resetTimer]);

  return null; // This component does not render anything
};

export default InactivityTimeout;
