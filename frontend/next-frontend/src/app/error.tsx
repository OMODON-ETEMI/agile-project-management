'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HomeIcon, RefreshCcw, ChevronLeft } from 'lucide-react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-8 text-center">
        {/* Logo Section */}
        <div className="flex justify-center">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={48}
            height={48}
            className="w-12 h-12"
          />
        </div>

        {/* Lottie Animation via CDN */}
        <div className="flex justify-center">
          <iframe
            src="https://lottie.host/embed/2e2e2e2e-2e2e-4e4e-8e8e-2e2e2e2e2e2e/2e2e2e2e.json"
            title="Error Animation"
            style={{ width: 220, height: 220, background: 'none', border: 'none' }}
            allowFullScreen
          />
        </div>

        {/* Emoji and Error Message */}
        <div className="space-y-4">
          <div className="text-6xl">😢</div>
          <h1 className="text-3xl font-bold text-gray-900">Oops! Something went wrong</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            We encountered an unexpected issue. Our team has been notified and is working on it.
          </p>
        </div>

        {/* Recovery Options */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 gap-2 w-full sm:w-auto"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 gap-2 w-full sm:w-auto"
          >
            <HomeIcon className="w-4 h-4" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 gap-2 w-full sm:w-auto"
          >
            <ChevronLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}