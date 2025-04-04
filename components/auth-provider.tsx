"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react"
import { User, LoginDto, RegisterUserDto } from "@/lib/types"
import {
  loginUser,
  registerUser,
  updateUserProfile,
  changePassword,
  getCurrentUser,
  isAuthenticated,
  logoutUser
} from "@/lib/api"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginDto) => Promise<User>
  register: (data: RegisterUserDto) => Promise<User>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<User>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const loadUser = useCallback(async () => {
    try {
      console.log('Auth Provider: Loading user - start')
      setIsLoading(true)
      
      // Try to get user directly from localStorage for immediate access
      if (typeof window !== 'undefined') {
        const storage = await import('@/lib/storage').then(module => module.storage)
        const storedAuth = storage.get<{isAuthenticated: boolean, user: User}>('auth_state')
        if (storedAuth?.isAuthenticated && storedAuth?.user) {
          console.log('Auth Provider: Found user in localStorage')
          setUser(storedAuth.user)
          setIsAuthenticated(true)
          setIsLoading(false)
          return
        }
      }
      
      // If direct localStorage access fails, try through getCurrentUser
      const currentUser = await getCurrentUser()
      
      if (currentUser) {
        console.log('Auth Provider: User found from getCurrentUser')
        setUser(currentUser)
        setIsAuthenticated(true)
      } else {
        console.log('Auth Provider: No user found')
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth Provider: Error loading user', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (data: LoginDto) => {
    setIsLoading(true)
    try {
      const user = await loginUser(data)
      setUser(user)
      setIsAuthenticated(true)
      return user
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (data: RegisterUserDto) => {
    setIsLoading(true)
    try {
      await registerUser(data)
      const user = await loginUser({
        Email: data.Email,
        Password: data.Password
      })
      setUser(user)
      setIsAuthenticated(true)
      return user
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    logoutUser()
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!user) throw new Error("Not logged in")

    setIsLoading(true)
    try {
      await updateUserProfile({
        Name: data.name || user.name,
        PhoneNumber: data.phoneNumber || user.phoneNumber
      })

      const updatedUser = {
        ...user,
        ...data
      }
      setUser(updatedUser)
      return updatedUser
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const handleChangePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error("Not logged in")

    setIsLoading(true)
    try {
      await changePassword({
        OldPassword: currentPassword,
        NewPassword: newPassword
      })
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword: handleChangePassword
  }), [
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    handleChangePassword
  ])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}