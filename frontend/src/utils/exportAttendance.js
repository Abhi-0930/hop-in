import { format } from 'date-fns'

export function exportAttendanceToCSV(attendance, children = []) {
  const headers = ['Date', 'Child', 'Boarding Time', 'School Arrival']
  const escape = (v) => ((v ?? '').includes(',') ? `"${v}"` : (v ?? '—'))
  const rows = attendance.map((a) => {
    const child = children.find((c) => c.childId === a.childId)
    return [
      a.date?.toDate?.() ? format(a.date.toDate(), 'yyyy-MM-dd') : '—',
      escape(child?.name || a.childName),
      a.boardingTime?.toDate?.() ? format(a.boardingTime.toDate(), 'HH:mm') : '—',
      a.schoolArrivalTime?.toDate?.() ? format(a.schoolArrivalTime.toDate(), 'HH:mm') : '—',
    ]
  })
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `attendance-${format(new Date(), 'yyyy-MM-dd')}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}
