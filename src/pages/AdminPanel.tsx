import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

interface Profile {
  id: string
  email: string | null
  full_name: string | null
  role: string | null
  created_at: string | null
}

export default function AdminPanel() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: 'admin' | 'student') => {
    setUpdating(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      
      // Update local state
      setProfiles(profiles.map(profile => 
        profile.id === userId ? { ...profile, role: newRole } : profile
      ))
    } catch (error) {
      console.error('Error updating user role:', error)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Admin Panel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">
                    👋 Welcome, Admin!
                  </h3>
                  <p className="text-blue-700">
                    Manage users, opportunities, and platform settings from here.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading users...</div>
                ) : (
                  <div className="space-y-4">
                    {profiles.map((profile) => (
                      <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">
                            {profile.full_name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {profile.email || 'No email'}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {profile.id}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                            {profile.role || 'student'}
                          </Badge>
                          {profile.id !== user?.id && (
                            <div className="flex gap-2">
                              {profile.role !== 'admin' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateUserRole(profile.id, 'admin')}
                                  disabled={updating === profile.id}
                                >
                                  {updating === profile.id ? 'Promoting...' : 'Make Admin'}
                                </Button>
                              )}
                              {profile.role === 'admin' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateUserRole(profile.id, 'student')}
                                  disabled={updating === profile.id}
                                >
                                  {updating === profile.id ? 'Removing...' : 'Remove Admin'}
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 