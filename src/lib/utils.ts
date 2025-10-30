import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple localStorage cache with TTL
export function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { value, expiresAt } = JSON.parse(raw) as { value: T; expiresAt?: number }
    if (expiresAt && Date.now() > expiresAt) {
      localStorage.removeItem(key)
      return null
    }
    return value
  } catch {
    return null
  }
}

export function setCache<T>(key: string, value: T, ttlMs = 60_000) {
  try {
    const payload = JSON.stringify({ value, expiresAt: Date.now() + ttlMs })
    localStorage.setItem(key, payload)
  } catch {}
}