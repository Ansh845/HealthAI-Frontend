'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from '@clerk/nextjs'

export default function Navbar() {
  const router = useRouter()
  const { user, isSignedIn } = useUser()
  const [role, setRole] = useState<string | null>(null)
  const [activePath, setActivePath] = useState('');
  const [synced, setSynced] = useState(false);

  // Track current path
  useEffect(() => {
    setActivePath(window.location.pathname)
  }, [])

  // Fetch role from localStorage
  useEffect(() => {
    if (isSignedIn && user) {
      const storedRole = localStorage.getItem('role')
      setRole(storedRole || 'patient')
    } else {
      setRole(null)
    }
  }, [isSignedIn, user])

  // Sync user with backend
  useEffect(() => {
    if (!isSignedIn || !user || synced) return;

    const createUser = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        
        const res = await fetch(`${API_BASE_URL}/addUser`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            name: user.fullName,
            role: 'patient' // default role
          }),
        });

        if (res.ok) {
          console.log("✅ User synced with backend");
          const data = await res.json();
          
          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify({
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            name: user.fullName,
            role: 'patient',
            pseudonym_id: data.pseudonym_id
          }));
          localStorage.setItem('role', 'patient');
          
          setRole('patient');
        }
        setSynced(true);
      } catch (err) {
        console.error('❌ Error syncing user:', err);
      }
    };

    createUser();
  }, [user, isSignedIn, synced]);

  const linkClass = (path: string) =>
    `transition-colors ${activePath === path
      ? 'text-vibrant-blue'
      : 'text-gray-700 hover:text-vibrant-orange'
    }`

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-extrabold gradient-text">
          MedicoTourism
        </Link>

        <nav className="flex items-center gap-6 text-l font-semibold">
          {role === 'patient' && (
            <>
              <Link href="/intake" className={linkClass('/intake')}>
                Medical Form
              </Link>
              <Link href="/profile" className={linkClass('/profile')}>
                Profile
              </Link>
            </>
          )}

          {role === 'doctor' && (
            <>
              <Link href="/doctor" className={linkClass('/doctor')}>
                Doctor Panel
              </Link>
              <Link href="/reports" className={linkClass('/reports')}>
                Reports
              </Link>
            </>
          )}

          {role === 'admin' && (
            <Link href="/admin" className={linkClass('/admin')}>
              Admin Dashboard
            </Link>
          )}
        </nav>

        <div>
          <SignedOut>
            <div className="flex gap-3">
              <SignInButton mode="redirect">
                <button className="bg-[#6c47ff] cursor-pointer text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-11 px-4 sm:px-5 transition-transform hover:scale-105">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="redirect">
                <button className="bg-[#6c47ff] cursor-pointer text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-11 px-4 sm:px-5 transition-transform hover:scale-105">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}