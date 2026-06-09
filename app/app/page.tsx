'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AppPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verify authentication before loading clinic app
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          credentials: 'include',
        });

        if (!res.ok) {
          // Not authenticated, redirect to login
          router.push('/app/login');
          return;
        }

        // Authenticated - store role and show clinic app
        const userRole = await res.json();
        localStorage.setItem('userRole', userRole.role);

        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/app/login');
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      // Set clinic app role after component mounts
      const userRole = localStorage.getItem('userRole');
      const isAdminUser = userRole === 'admin';

      // Set isAdmin in the window context for clinic app
      if (typeof window !== 'undefined') {
        (window as any).isAdmin = isAdminUser;
      }

      // Update role display in clinic app
      setTimeout(() => {
        const roleStrip = document.querySelector('.role-strip');
        if (roleStrip) {
          roleStrip.className = 'role-strip ' + (isAdminUser ? 'adm' : 'rec');
          const txt = roleStrip.querySelector('#role-strip-txt');
          if (txt) txt.textContent = isAdminUser ? 'Admin' : 'Reception';
        }

        const roleLabel = document.getElementById('role-lbl');
        if (roleLabel) {
          roleLabel.textContent = 'Logged in as: ' + (isAdminUser ? 'Admin' : 'Reception');
        }

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

        // Lock admin-only menu items for non-admin users
        if (!isAdminUser) {
          // Lock P&L (Clinic P&L, Therapist payouts, Expense tracker are admin-only)
          const adminOnlyItems = document.querySelectorAll('[data-admin-only]');
          adminOnlyItems.forEach((item: any) => {
            item.style.pointerEvents = 'none';
            item.style.opacity = '0.5';
            item.style.cursor = 'not-allowed';
          });

          // Alternative: find by text content
          const menuItems = document.querySelectorAll('a, button');
          menuItems.forEach((item: any) => {
            const text = item.textContent?.toLowerCase() || '';
            if (text.includes('p&l') || text.includes('therapist payouts') ||
                text.includes('expense tracker') || text.includes('clinic p&l')) {
              item.style.pointerEvents = 'none';
              item.style.opacity = '0.5';
              item.style.cursor = 'not-allowed';
            }
          });
        }
      }, 100);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', color: '#999' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <iframe
      src="/clinic.html"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        margin: 0,
        padding: 0,
      }}
      title="Clinic Management System"
    />
  );
}
