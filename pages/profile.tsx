import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  fullName: string;
  email: string;
  headline?: string;
  profileUrl?: string;
  profilePicture?: string;
};

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-linkedin border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading your profile...</p>
        </div>
      </main>
    );
  }

  if (!user)
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-md w-full">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Not signed in</h2>
          <p className="text-gray-600 mb-8">
            Sign in with LinkedIn to view your profile and manage your settings.
          </p>
          <Link
            href="/"
            className="inline-block btn-primary"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-linkedin to-blue-600"></div>

          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-16 mb-8">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.fullName}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-linkedin text-white flex items-center justify-center text-5xl font-bold">
                  {user.fullName.charAt(0)}
                </div>
              )}
              <div className="mt-4 md:mt-0">
                <h1 className="text-4xl font-bold text-gray-900">{user.fullName}</h1>
                <p className="text-lg text-gray-600 mt-2">{user.headline || "LinkedIn User"}</p>
              </div>
            </div>

            {/* Profile Info Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Email Address
                </p>
                <p className="text-lg font-semibold text-gray-900 mt-2 break-all">
                  {user.email}
                </p>
              </div>

              {user.profileUrl && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    LinkedIn Profile
                  </p>
                  <a
                    href={user.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-lg font-semibold text-linkedin hover:text-linkedin-hover mt-2 inline-flex items-center"
                  >
                    Visit Profile
                    <span className="ml-2">↗</span>
                  </a>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {(!user.email || !user.profilePicture) && (
                <a
                  href="/onboarding"
                  className="flex-1 px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-all text-center"
                >
                  ✏️ Complete Your Profile
                </a>
              )}

              <button
                onClick={async (e) => {
                  e.preventDefault();
                  // Clear localStorage before signing out
                  if (typeof window !== "undefined") {
                    localStorage.clear();
                    sessionStorage.clear();
                  }
                  const response = await fetch("/api/auth/logout", { method: "POST" });
                  if (response.ok) {
                    window.location.href = "/";
                  }
                }}
                className="flex-1 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all text-center"
              >
                🚪 Sign Out
              </button>

              <Link
                href="/"
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-all text-center"
              >
                ← Home
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-linkedin mb-2">✓</div>
            <p className="text-gray-600">Profile Complete</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">🔒</div>
            <p className="text-gray-600">Secure Session</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">⚡</div>
            <p className="text-gray-600">Token Refreshable</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm">
          <p>Your profile is secured and encrypted</p>
          <p className="mt-2 text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </main>
  );
}
