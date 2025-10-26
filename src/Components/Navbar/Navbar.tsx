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

  // Track current path
  useEffect(() => {
    setActivePath(window.location.pathname)
  }, [])

  // Example: Fetch custom role from backend (if Clerk user is linked to your DB)
  useEffect(() => {
    if (isSignedIn && user) {
      const storedRole = localStorage.getItem('role')
      setRole(storedRole || 'patient') // fallback
    } else {
      setRole(null)
    }
  }, [isSignedIn, user])

  const linkClass = (path: string) =>
    `transition-colors ${activePath === path
      ? 'text-vibrant-blue'
      : 'text-gray-700 hover:text-vibrant-orange'
    }`

    const myrole='user';

  const [synced, setSynced] = useState(false);
  useEffect(() => {
    if (!isSignedIn || !user || synced) return;

    const createUser = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/addUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            name: user.fullName,
            role: myrole
          }),
        });

        if (res.ok) console.log("User synced");
        setSynced(true); // prevent multiple calls
      } catch (err) {
        console.error(err);
      }
    };

    createUser();
  }, [user, isSignedIn, synced]);

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-extrabold gradient-text">
          MedicoTourism
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-6 text-l font-semibold">

          {/* Role-based routes */}
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

        {/* Right side buttons */}
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
