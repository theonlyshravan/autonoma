"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return <div className="h-screen w-screen bg-black flex items-center justify-center text-white">Redirecting to Airlock...</div>;
}
