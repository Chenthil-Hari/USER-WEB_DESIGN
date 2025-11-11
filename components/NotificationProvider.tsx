'use client'

import { useNotifications } from './NotificationCenter'
import NotificationToast from './NotificationToast'
import { useEffect, useState } from 'react'

export default function NotificationProvider() {
  const notifications = useNotifications()
  const [displayed, setDisplayed] = useState<Set<string>>(new Set())

  useEffect(() => {
    notifications.forEach(notif => {
      if (!displayed.has(notif.id)) {
        setDisplayed(prev => new Set(prev).add(notif.id))
      }
    })
  }, [notifications, displayed])

  return (
    <>
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => {
            // Notification will auto-close
          }}
        />
      ))}
    </>
  )
}

