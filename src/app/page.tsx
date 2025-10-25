'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Home from '@/Components/Home/Home';
import {useUser} from '@clerk/nextjs';

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // useEffect(() => {
  //   if (isLoaded && user) {
  //     router.push('/explore');
  //   }
  // }, [isLoaded, user, router]);

  if (user) {
    return null; // Will redirect
  }

  return (
    <>
      <Home />
    </>
  );
}
