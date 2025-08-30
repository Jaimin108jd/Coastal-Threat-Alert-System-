import { useState, useEffect } from 'react'

interface User {
    id: string | null
    email: string | null
    given_name: string | null
    family_name: string | null
    picture: string | null
}

interface UseUserReturn {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    refetch: () => void
}

export function useUser(): UseUserReturn {
    const [user, setUser] = useState<User | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchUser = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await fetch('/api/user/me', {
                method: 'GET',
                credentials: 'include',
            })

            if (response.ok) {
                const data = await response.json()
                setUser(data.user)
                setIsAuthenticated(data.isAuthenticated)
            } else if (response.status === 401) {
                setUser(null)
                setIsAuthenticated(false)
            } else {
                throw new Error('Failed to fetch user data')
            }
        } catch (err) {
            console.error('Error fetching user:', err)
            
            setError(err instanceof Error ? err.message : 'Unknown error')
            setUser(null)
            setIsAuthenticated(false)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        refetch: fetchUser
    }
}
