import { MotionConfig } from 'framer-motion'
import { useState } from 'react'
import { RouterProvider } from 'react-router'
import { createRouter } from './router'

/** Application root: routing only. Providers live in RootLayout so every route shares them. */
export function App() {
  const [router] = useState(createRouter)
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  )
}
