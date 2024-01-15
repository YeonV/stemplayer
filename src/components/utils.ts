import { createTheme } from '@mui/material'
import { Inter } from 'next/font/google'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    text: {
      primary: '#f9f9fb'
    },
    primary: {
      main: '#0dbedc'
    },
    secondary: {
      main: '#0dbedc'
    },
    error: {
      main: '#a00000'
    },
    info: {
      main: '#999999'
    },
    background: {
      default: '#000',
      paper: '#1c1c1e'
    }
  }
})

export const inter = Inter({ subsets: ['latin'] })

export const TrackType = ['drums', 'bass', 'instrumental', 'vocals', 'other', 'master'] as const

export interface ITrack {
  path?: string
  audio: HTMLAudioElement
}

export function formatDuration(duration: number) {
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration - hours * 3600) / 60)
  const seconds = Math.floor(duration - hours * 3600 - minutes * 60)

  let result = ''
  if (hours > 0) {
    result += hours.toString().padStart(2, '0') + ':'
  }
  result += minutes.toString().padStart(2, '0') + ':'
  result += seconds.toString().padStart(2, '0')
  return result
}

export function throttle(func: any, delay: number) {
  let lastCall = 0
  return function (...args: any[]) {
    const now = new Date().getTime()
    if (now - lastCall < delay) {
      return
    }
    lastCall = now
    return func(...args)
  }
}
