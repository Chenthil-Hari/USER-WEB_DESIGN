'use client'

import { useState, useEffect } from 'react'

interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  timestamp: Date
}

let notificationId = 0
const listeners: Array<(notifications: Notification[]) => void> = []
let notifications: Notification[] = []

export function addNotification(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
  const notification: Notification = {
    id: `notification-${Date.now()}-${notificationId++}`,
    message,
    type,
    timestamp: new Date()
  }
  
  notifications = [notification, ...notifications].slice(0, 5) // Keep only last 5
  listeners.forEach(listener => listener([...notifications]))
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    notifications = notifications.filter(n => n.id !== notification.id)
    listeners.forEach(listener => listener([...notifications]))
  }, 5000)
  
  return notification.id
}

export function useNotifications() {
  const [state, setState] = useState<Notification[]>(notifications)

  useEffect(() => {
    const listener = (newNotifications: Notification[]) => {
      setState([...newNotifications])
    }
    listeners.push(listener)
    
    // Initial state
    setState([...notifications])
    
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return state
}

