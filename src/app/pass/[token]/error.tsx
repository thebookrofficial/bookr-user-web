"use client";

import { useEffect } from "react";
import Image from "next/image";
import networkFailedImg from "@/assets/images/network/network-failed-img.jpg";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Pass Page Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-sans text-neutral-200">
      <div className="max-w-sm w-full bg-[#151515] rounded-3xl border border-neutral-800 overflow-hidden relative shadow-2xl p-8 text-center flex flex-col items-center">
        <Image
          src={networkFailedImg}
          alt="Something went wrong"
          width={160}
          height={160}
          priority
          className="rounded-2xl mb-6 shadow-md border border-neutral-800 object-cover"
        />
        <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-sm text-neutral-400 mb-8">
          We couldn&apos;t load your pass. This might be due to a network issue.
        </p>
        <button
          onClick={() => reset()}
          className="bg-white text-black px-8 py-3 rounded-full font-semibold text-sm hover:bg-neutral-200 transition-colors w-full"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
