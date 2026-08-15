import { createContext, useContext, useState, type ReactNode } from 'react'

type User = {
  id: string
  name: string
  phone: string
  role: string
}

type AuthContextType = {
  user: User | null
  login: (user: User, remember?: boolean) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user') || sessionStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (userData: User, remember: boolean = true) => {
    setUser(userData)
    if (remember) {
      localStorage.setItem('user', JSON.stringify(userData))
      sessionStorage.removeItem('user')
    } else {
      sessionStorage.setItem('user', JSON.stringify(userData))
      localStorage.removeItem('user')
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    sessionStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}