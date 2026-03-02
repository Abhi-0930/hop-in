import { useAuth } from '../context/AuthContext'

const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true'

export default function ConnectionError() {
  const { connectionError, setConnectionError } = useAuth()

  if (!connectionError) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Issue</h2>
        {useEmulators ? (
          <>
            <p className="text-slate-600 mb-4">
              <strong>Using Emulators</strong> — Make sure Firebase emulators are running first.
            </p>
            <p className="text-slate-600 text-sm mb-4 text-left">
              In a separate terminal, run:
            </p>
            <code className="block bg-slate-100 p-3 rounded text-left text-sm mb-4 overflow-x-auto">
              cd f:\Client-Projects\hop-in<br />
              npx firebase emulators:start --only auth,firestore,storage
            </code>
            <p className="text-slate-500 text-xs mb-4">
              Keep that terminal open, then click Retry.
            </p>
          </>
        ) : (
          <>
            <p className="text-slate-600 mb-4">
              Firestore requests are being blocked. Often caused by: ad blocker, tracking protection, firewall, or network restrictions.
            </p>
            <p className="text-slate-600 text-sm mb-4">
              <strong>Alternative:</strong> Use emulators — set <code className="bg-slate-100 px-1">VITE_USE_EMULATORS=true</code> in .env and run the emulators locally.
            </p>
          </>
        )}
        <button
          onClick={() => {
            setConnectionError(false)
            window.location.reload()
          }}
          className="px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
