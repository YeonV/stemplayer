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

export const TrackType = ['drums', 'bass', 'instrumental', 'vocals', 'other'] as const

export interface ITrack {
  path: string
  audio: HTMLAudioElement
}
