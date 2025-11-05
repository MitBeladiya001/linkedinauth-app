import Link from 'next/link'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // Clear any cached user data when returning to home
    if (typeof window !== "undefined") {
      const clearCache = () => {
        // Check if user is actually logged in by trying to fetch /api/me
        fetch("/api/me")
          .then(res => {
            if (!res.ok) {
              // Not logged in, clear cache
              localStorage.clear()
              sessionStorage.clear()
            }
          })
          .catch(() => {
            // Error checking auth, clear cache as precaution
            localStorage.clear()
            sessionStorage.clear()
          })
      }
      clearCache()
    }
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="mb-6 inline-block">
            <div className="w-20 h-20 bg-linkedin rounded-full flex items-center justify-center text-white text-4xl font-bold">
              Ⓛ
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            LinkedIn OAuth Demo
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Secure authentication with LinkedIn
          </p>
          <p className="text-gray-500">
            Sign in with your LinkedIn account to get started
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-10 mb-8">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-linkedin text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Sign in with LinkedIn
                </h3>
                <p className="text-gray-600 mt-1">
                  Click the button below to authenticate securely
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-linkedin text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  View Your Profile
                </h3>
                <p className="text-gray-600 mt-1">
                  Your LinkedIn profile data is securely stored
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-linkedin text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Manage Settings
                </h3>
                <p className="text-gray-600 mt-1">
                  Update your profile information anytime
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <a
              href="/api/auth/linkedin"
              className="btn-primary block text-center w-full text-lg font-semibold"
            >
              <span className="inline-block mr-2">→</span>
              Sign in with LinkedIn
            </a>

            <Link
              href="/profile"
              className="block text-center px-6 py-3 text-linkedin font-semibold rounded-lg hover:bg-gray-100 border-2 border-linkedin transition-all"
            >
              View Profile
            </Link>
          </div>
        </div>

        <div className="text-center text-gray-600 text-sm">
          <p>Your profile data is encrypted and securely stored</p>
          <p className="mt-2 text-gray-500">
            Built with Next.js • TypeScript • MongoDB • LinkedIn OAuth 2.0
          </p>
        </div>
      </div>
    </main>
  )
}
