'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/src/Authentication/authcontext'
import { recentOrganisation } from '@/src/lib/api/organisation'
import { Organisation } from '@/src/helpers/type'
import { OrganizationCard } from '@/src/components/ui/organisationUI'

export default function RecentOrganizations() {
  const { currentUser } = useAuth()
  const [recentOrganizations, setRecentOrganizations] = useState<Organisation[]>([])

  useEffect(() => {
    if (!currentUser) return

    const fetchRecentOrganizations = async () => {
      try {
        const data = await recentOrganisation()
        setRecentOrganizations(data)
      } catch (error) {
        console.error('Error fetching recent organizations:', error)
      }
    }

    fetchRecentOrganizations()
  }, [currentUser])

  if (!currentUser || recentOrganizations.length === 0) return null

  return (
    <section className="mb-8">
      <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4">
        Recent Organizations
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {recentOrganizations.map((org) => (
          <OrganizationCard key={org._id} organization={org} />
        ))}
      </div>
    </section>
  )
}
