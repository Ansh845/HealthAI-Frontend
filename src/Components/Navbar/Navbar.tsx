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
  const { user, isSignedIn, isLoaded } = useUser() // Added isLoaded
  const [role, setRole] = useState<string | null>(null)
  const [activePath, setActivePath] = useState('')
  const [synced, setSynced] = useState(false)
  const [loading, setLoading] = useState(true) // Track loading state

  // Track current path
  useEffect(() => {
    setActivePath(window.location.pathname)
  }, [])

  // Fetch role from localStorage and set default
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && user) {
        const storedRole = localStorage.getItem('role')
        setRole(storedRole || 'user') // Default to 'user' if no role
      } else {
        setRole(null)
      }
      setLoading(false)
    }
  }, [isSignedIn, user, isLoaded])

  // Sync user with backend
  useEffect(() => {
    if (!isSignedIn || !user || synced) return

    const createUser = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        
        const res = await fetch(`${API_BASE_URL}/api/addUser`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            name: user.fullName,
            role: 'user', // default role
          }),
        })

        if (res.ok) {
          console.log('✅ User synced with backend')
          const data = await res.json()
          
          // Store user data in localStorage
          const userData = {
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            name: user.fullName,
            role: 'user',
            pseudonym_id: data.user?._id || data.pseudonym_id,
          }
          
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('role', 'user')
          
          setRole('user')
        } else {
          console.error('❌ Failed to sync user:', await res.text())
        }
        setSynced(true)
      } catch (err) {
        console.error('❌ Error syncing user:', err)
        setSynced(true) // Mark as synced even on error to prevent infinite retry
      }
    }

    createUser()
  }, [user, isSignedIn, synced])

  const linkClass = (path: string) =>
    `transition-colors ${
      activePath === path
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
          {/* Show loading state */}
          {loading && isSignedIn && (
            <div className="text-gray-400">Loading...</div>
          )}

          {/* Always show basic navigation for signed-in users */}
          {!loading && isSignedIn && (
            <>
              <Link href="/" className={linkClass('/')}>
                Home
              </Link>
              <Link href="/intake" className={linkClass('/intake')}>
                Medical Form
              </Link>
              <Link href="/profile" className={linkClass('/profile')}>
                Profile
              </Link>
            </>
          )}

          {/* Role-specific navigation */}
          {!loading && role === 'doctor' && (
            <>
              <Link href="/doctor" className={linkClass('/doctor')}>
                Doctor Panel
              </Link>
              <Link href="/reports" className={linkClass('/reports')}>
                Reports
              </Link>
            </>
          )}

          {!loading && role === 'admin' && (
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