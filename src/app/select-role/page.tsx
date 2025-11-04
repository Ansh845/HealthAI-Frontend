"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function SelectRolePage() {
  const router = useRouter();
  const { userId, getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const {user} = useUser();

  const selectRole = async (role: string) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const token = await getToken();
      const clerkId=user?.id;

      const res = await fetch("http://localhost:5001/api/user/set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`, // or token once backend validates JWT
        },
        body: JSON.stringify({ role ,clerkId}),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/`);
      } else {
        alert(data.message || "Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
      <h1 className="text-2xl font-semibold mb-4">Welcome!</h1>
      <p className="mb-8 text-gray-700">Please select your role to continue:</p>

      <div className="space-y-4">
        <button
          disabled={loading}
          onClick={() => selectRole("patient")}
          className="w-64 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow"
        >
          I am a Patient
        </button>

        <button
          disabled={loading}
          onClick={() => selectRole("doctor")}
          className="w-64 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg shadow"
        >
          I am a Doctor
        </button>
      </div>

      {loading && <p className="mt-6 text-gray-600">Updating role...</p>}
    </div>
  );
}
