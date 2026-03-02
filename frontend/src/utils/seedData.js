import { collection, doc, setDoc, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'

const SAMPLE_SCHOOLS = [
  {
    schoolId: 'school-1',
    name: 'Delhi Public School',
    address: 'Sector 45, Gurgaon',
    latitude: 28.4595,
    longitude: 77.0266,
    city: 'Gurgaon',
  },
  {
    schoolId: 'school-2',
    name: 'Ryan International School',
    address: 'Sector 31, Gurgaon',
    latitude: 28.4517,
    longitude: 77.0738,
    city: 'Gurgaon',
  },
  {
    schoolId: 'school-3',
    name: 'The Heritage School',
    address: 'Sector 62, Gurgaon',
    latitude: 28.4322,
    longitude: 77.0747,
    city: 'Gurgaon',
  },
]

export async function seedSchools() {
  for (const school of SAMPLE_SCHOOLS) {
    await setDoc(doc(db, 'schools', school.schoolId), school)
  }
  return SAMPLE_SCHOOLS.length
}

export async function seedVans(driverIds = []) {
  if (driverIds.length === 0) {
    const usersSnap = await getDocs(collection(db, 'users'))
    const drivers = usersSnap.docs
      .filter((d) => d.data().role === 'driver')
      .map((d) => d.id)
    driverIds = drivers
  }
  if (driverIds.length === 0) return 0

  const vans = SAMPLE_SCHOOLS.flatMap((school, i) => {
    const driverId = driverIds[i % driverIds.length]
    return [
      {
        vanId: `van-${school.schoolId}-1`,
        driverId,
        schoolId: school.schoolId,
        capacity: 20,
        currentVacancy: 15,
        enrolledChildren: [],
        pricePerMonth: 2500,
        route: [
          { latitude: 28.47, longitude: 77.02, order: 1 },
          { latitude: 28.46, longitude: 77.03, order: 2 },
          { latitude: school.latitude, longitude: school.longitude, order: 3 },
        ],
        pickupTime: '07:00',
        dropTime: '15:30',
        isActive: true,
      },
    ]
  })

  for (const van of vans) {
    await setDoc(doc(db, 'vans', van.vanId), van)
  }
  return vans.length
}

export async function seedAll() {
  const schoolCount = await seedSchools()
  const vanCount = await seedVans()
  return { schoolCount, vanCount }
}
