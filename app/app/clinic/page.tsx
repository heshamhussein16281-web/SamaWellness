'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClinicPage() {
  const router = useRouter();

  useEffect(() => {
    // Verify authentication
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          credentials: 'include',
        });

        if (!res.ok) {
          router.push('/app/login');
          return;
        }

        // If authenticated, load the clinic HTML
        loadClinicApp();
      } catch (err) {
        router.push('/app/login');
      }
    };

    checkAuth();
  }, [router]);

  const loadClinicApp = () => {
    fetch('/clinic.html')
      .then((res) => res.text())
      .then((html) => {
        // Replace entire document with clinic app
        document.open();
        document.write(html);
        document.close();
      })
      .catch((err) => {
        console.error('Failed to load clinic app:', err);
        document.body.innerHTML = '<p>Failed to load clinic app</p>';
      });
  };

  return null;
}
