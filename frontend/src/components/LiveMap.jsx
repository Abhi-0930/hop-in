import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { calculateDistance } from '../utils/haversine'

// Fix default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function MapUpdater({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, map.getZoom())
  }, [map, center])
  return null
}

export default function LiveMap({ driverLocation, center, onDistanceAlert }) {
  const [lastAlert, setLastAlert] = useState(null)

  useEffect(() => {
    if (!driverLocation || !onDistanceAlert || !center) return
    const distanceKm = calculateDistance(
      center[0], center[1],
      driverLocation.latitude, driverLocation.longitude
    )
    if (distanceKm <= 0.5 && lastAlert !== '0.5') {
      setLastAlert('0.5')
      onDistanceAlert('Van almost here — get ready!')
    } else if (distanceKm <= 1 && lastAlert !== '1') {
      setLastAlert('1')
      onDistanceAlert('Van approaching — 1 km away')
    }
  }, [driverLocation, center, onDistanceAlert, lastAlert])

  const vanPos = driverLocation
    ? [driverLocation.latitude, driverLocation.longitude]
    : null

  return (
    <div className="h-64 rounded-lg overflow-hidden border border-slate-200">
      <MapContainer
        center={center || [28.4595, 77.0266]}
        zoom={14}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {vanPos && (
          <Marker position={vanPos}>
            <Popup>Van location (live)</Popup>
          </Marker>
        )}
        <MapUpdater center={center} />
      </MapContainer>
    </div>
  )
}
