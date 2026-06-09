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

        // After document is loaded, set the user role
        // Wait for clinic app to initialize before setting role
        setTimeout(() => {
          const userRole = localStorage.getItem('userRole');
          const isAdminUser = userRole === 'admin';

          // Set isAdmin in the window context for clinic app
          if (typeof window !== 'undefined') {
            (window as any).isAdmin = isAdminUser;
          }

          // Update role strip display
          const roleStrip = document.querySelector('.role-strip');
          if (roleStrip) {
            roleStrip.className = 'role-strip ' + (isAdminUser ? 'adm' : 'rec');
            const txt = roleStrip.querySelector('#role-strip-txt');
            if (txt) txt.textContent = isAdminUser ? 'Admin' : 'Reception';
          }

          // Update role label in top bar
          const roleLabel = document.getElementById('role-lbl');
          if (roleLabel) {
            roleLabel.textContent = 'Logged in as: ' + (isAdminUser ? 'Admin' : 'Reception');
          }

          // Lock/unlock admin nav based on role
          const admNav = document.getElementById('nav-admin');
          if (admNav) {
            if (isAdminUser) {
              admNav.classList.remove('locked');
              admNav.style.pointerEvents = 'auto';
              admNav.style.opacity = '1';
            } else {
              admNav.classList.add('locked');
              admNav.style.pointerEvents = 'none';
              admNav.style.opacity = '0.5';
            }
          }

          console.log('User role set to:', isAdminUser ? 'Admin' : 'Reception');
        }, 500);
      })
      .catch((err) => {
        console.error('Failed to load clinic app:', err);
        document.body.innerHTML = '<p>Failed to load clinic app</p>';
      });
  };

  return null;
}
