import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Onboarding() {
  const [email, setEmail] = useState('')
  const [profilePicture, setProfilePicture] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errors, setErrors] = useState<{ email?: string; profilePicture?: string }>({})

  async function submit(e: any) {
    e.preventDefault()
    setErrors({})

    if (!email) {
      setErrors({ email: 'Email is required' })
      return
    }

    if (profilePicture && !profilePicture.startsWith('http')) {
      setErrors({ profilePicture: 'Please enter a valid image URL' })
      return
    }

    setStatus('saving')
    const res = await fetch('/api/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email || undefined,
        profilePicture: profilePicture || undefined,
      }),
    })
    if (res.ok) {
      setStatus('saved')
      setTimeout(() => (window.location.href = '/profile'), 1500)
    } else {
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Success State */}
        {status === 'saved' && (
          <div className="bg-green-50 border-2 border-green-400 rounded-2xl shadow-2xl p-10 text-center mb-8 animate-pulse">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">
              Profile Updated!
            </h2>
            <p className="text-green-700">
              Redirecting to your profile...
            </p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="bg-red-50 border-2 border-red-400 rounded-2xl shadow-2xl p-10 mb-8">
            <div className="flex items-center mb-4">
              <div className="text-3xl mr-4">⚠️</div>
              <div>
                <h2 className="text-2xl font-bold text-red-600">
                  Oops! Something went wrong
                </h2>
                <p className="text-red-700">
                  Please try again or contact support
                </p>
              </div>
            </div>
            <button
              onClick={() => setStatus('idle')}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Main Form */}
        {status !== 'saved' && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-linkedin to-blue-600 flex items-center justify-center">
              <h1 className="text-4xl font-bold text-white">📝</h1>
            </div>

            <div className="px-8 py-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Complete Your Profile
              </h2>
              <p className="text-gray-600 mb-10">
                Just a few more details to get started
              </p>

              <form onSubmit={submit} className="space-y-8">
                {/* Email Field */}
                <div>
                  <label className="label-text">
                    📧 Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors({ ...errors, email: undefined })
                    }}
                    placeholder="your.email@example.com"
                    className={`input-field ${
                      errors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                    disabled={status === 'saving'}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-2">✗ {errors.email}</p>
                  )}
                </div>

                {/* Profile Picture Field */}
                <div>
                  <label className="label-text">
                    🖼️ Profile Picture URL <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={profilePicture}
                    onChange={(e) => {
                      setProfilePicture(e.target.value)
                      if (errors.profilePicture) setErrors({ ...errors, profilePicture: undefined })
                    }}
                    placeholder="https://example.com/photo.jpg"
                    className={`input-field ${
                      errors.profilePicture ? 'border-red-500' : 'border-gray-200'
                    }`}
                    disabled={status === 'saving'}
                  />
                  {errors.profilePicture && (
                    <p className="text-red-500 text-sm mt-2">✗ {errors.profilePicture}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-2">
                    💡 Paste a direct URL to an image (e.g., from LinkedIn profile)
                  </p>
                </div>

                {/* Preview */}
                {profilePicture && (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-gray-600 font-semibold mb-4">Preview</p>
                    <img
                      src={profilePicture}
                      alt="Preview"
                      onError={() => setErrors({ ...errors, profilePicture: 'Image URL not accessible' })}
                      className="w-24 h-24 rounded-full mx-auto shadow-lg object-cover"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={status === 'saving'}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {status === 'saving' ? (
                      <>
                        <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>✓ Save Changes</>
                    )}
                  </button>

                  <Link
                    href="/profile"
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-all text-center"
                  >
                    ← Skip for Now
                  </Link>
                </div>
              </form>

              {/* Security Info */}
              <div className="mt-10 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-900 text-sm flex items-start">
                  <span className="mr-3">🔒</span>
                  <span>
                    Your information is encrypted and securely stored. We never share your data with third parties.
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
