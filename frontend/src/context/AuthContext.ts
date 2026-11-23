import { createContext, useContext } from 'react'

export interface AuthTokenContextValue {
  accessToken: string
}

export const AuthTokenContext =
  createContext<AuthTokenContextValue | null>(null)

export function useAuthToken(): string {
  const context = useContext(AuthTokenContext)

  if (!context) {
    throw new Error('Auth context is unavailable')
  }

  return context.accessToken
}