import { QRCodeSVG } from 'react-qr-code'

export default function ChildQRCard({ child, vanId, parentId, booking }) {
  const qrData = JSON.stringify({
    childId: child.childId,
    childName: child.name,
    parentId: parentId || '',
    vanId: vanId || '',
  })

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="bg-white p-3 rounded-lg border border-slate-200 shrink-0">
          <QRCodeSVG value={qrData} size={120} level="M" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900">{child.name}</h3>
          <p className="text-slate-500 text-sm">Age {child.age} • {child.schoolName}</p>
          {booking && (
            <div className="mt-2 p-2 bg-sky-50 rounded-lg">
              <p className="text-sky-700 text-sm font-medium">Active booking</p>
              <p className="text-slate-600 text-xs">Van: ₹{booking.monthlyPrice}/month</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
