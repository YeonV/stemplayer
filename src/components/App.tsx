import { useEffect, useRef, useState } from 'react'
import { Box, Button } from '@mui/material'
import { ITrack, TrackType } from '@/components/utils'
import AddFiles from './AddFiles'
import Song from './Song'
import Image from 'next/image'
import { Download, GitHub, Message } from '@mui/icons-material'
import MessageBar from './MessageBar'
import DetectedDialog from './DetectedDialog'
const path = require('path')

declare global {
  interface Window {
    electronAPI: any
  }
}
export default function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [trackPaths, setTrackPaths] = useState<string[]>([])
  const [tracksObject, setTracksObject] = useState<Record<string, Record<(typeof TrackType)[number], ITrack>>>({})
  const [expanded, setExpanded] = useState<string | false>(false)
  const [isPlaying, setIsPlaying] = useState({} as Record<string, boolean>)
  const [played, setPlayed] = useState(0)
  const isProd = process.env.NODE_ENV === 'production' && process.env.PROD_ENV === 'github'
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning' | 'info'>('success')
  const [messageOpen, setMessageOpen] = useState(false)
  const [detectedDialogOpen, setDetectedDialogOpen] = useState(false)
  // const [isLoading, setIsLoading] = useState(false)

  const showMessage = (message: string, messageType: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setMessage(message)
    setMessageType(messageType)
    setMessageOpen(true)
    setTimeout(() => {
      setMessageOpen(false)
      setTimeout(() => {
        setMessage('')
      }, 60)
    }, 2000 + (message?.length || 0) * 60)
  }

  const handleFiles = (files: any, web?: boolean) => {
    // setIsLoading(true)
    if (files.length === 0) return
    for (const file of files) {
      setTrackPaths((p) => [...p, web ? file.webkitRelativePath : file.path !== '' ? file.path : file.name])
      const reader = new FileReader()
      reader.onload = function (eb: any) {
        setTracksObject((o) => {
          if (file.webkitRelativePath && file.webkitRelativePath !== '') {
            // console.log(file.webkitRelativePath)
            const [base, song, type] = file.webkitRelativePath.split('/')
            const t = type.split('.')[0] as (typeof TrackType)[number]
            const audio = new Audio(eb.target.result)
            audio.volume = 0.5 // Set initial volume to 50%
            return {
              ...o,
              [song]: {
                ...(o[song] || []),
                [t]: {
                  path: file.webkitRelativePath,
                  audio: audio
                }
              }
            }
          } else {
            // console.log(file.path)
            const isWindows = file.path.includes('\\') || file.name.includes('\\')
            const [base, song, type] = (file.path !== '' ? file.path : file.name).split(isWindows ? '\\' : '/').slice(-3)
            const t = type.split('.')[0] as (typeof TrackType)[number]
            const audio = new Audio(eb.target.result)
            audio.volume = 0.5 // Set initial volume to 50%
            return {
              ...o,
              [song]: {
                ...(o[song] || []),
                [t]: {
                  path: file.path,
                  audio: audio
                }
              }
            }
          }
        })
      }
      reader.readAsDataURL(file)
    }
    // setIsLoading(false)
  }

  // const handleFiles = (files: any, web?: boolean) => {
  //   setIsLoading(true) // Start loading

  //   const loadPromises = Array.from(files).map(
  //     (file: any) =>
  //       new Promise((resolve) => {
  //         setTrackPaths((p) => [...p, web ? file.webkitRelativePath : file.path])
  //         const reader = new FileReader()
  //         reader.onload = function (eb: any) {
  //           setTracksObject((o) => {
  //             if (file.webkitRelativePath && file.webkitRelativePath !== '') {
  //               // console.log(file.webkitRelativePath)
  //               const [base, song, type] = file.webkitRelativePath.split('/')
  //               const t = type.split('.')[0] as (typeof TrackType)[number]
  //               const audio = new Audio(eb.target.result)
  //               audio.volume = 0.5 // Set initial volume to 50%
  //               return {
  //                 ...o,
  //                 [song]: {
  //                   ...(o[song] || []),
  //                   [t]: {
  //                     path: file.webkitRelativePath,
  //                     audio: audio
  //                   }
  //                 }
  //               }
  //             } else {
  //               // console.log(file.path)
  //               const isWindows = file.path.includes('\\') || file.name.includes('\\')
  //               const [base, song, type] = (file.path !== '' ? file.path : file.name).split(isWindows ? '\\' : '/').slice(-3)
  //               const t = type.split('.')[0] as (typeof TrackType)[number]
  //               const audio = new Audio(eb.target.result)
  //               audio.volume = 0.5 // Set initial volume to 50%
  //               return {
  //                 ...o,
  //                 [song]: {
  //                   ...(o[song] || []),
  //                   [t]: {
  //                     path: file.path,
  //                     audio: audio
  //                   }
  //                 }
  //               }
  //             }
  //           })
  //           resolve(true)
  //         }
  //         reader.readAsDataURL(file)
  //       })
  //   )

  //   Promise.all(loadPromises).then(() => {
  //     setIsLoading(false) // End loading
  //   })
  // }

  const onFileChange = (e: any) => {
    if (e.target.files) {
      handleFiles(e.target.files, true)
    }
  }

  const handleExpand = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  useEffect(() => {
    if (trackPaths.length === 0) return
    for (const trackPath of trackPaths) {
      const isWindows = trackPath.includes('\\')
      const [base, song, type] = trackPath.split(isWindows ? '\\' : '/').slice(-3)
      const t = type.split('.')[0] as (typeof TrackType)[number]
      setTracksObject((o) => {
        const t = type.split('.')[0] as (typeof TrackType)[number]
        return {
          ...o,
          [song]: {
            ...(o[song] || []),
            [t]: {
              path: trackPath,
              audio: o[song]?.[t]?.audio || new Audio()
            }
          }
        }
      })
    }
  }, [trackPaths])

  useEffect(() => {
    const anyTrackPlaying = Object.keys(tracksObject).find((key) => {
      if (
        Object.values(tracksObject[key]).some((track) => {
          return !track.audio.paused
        })
      )
        return key
    })
    setIsPlaying({ [anyTrackPlaying as any]: !!anyTrackPlaying })
  }, [tracksObject, played])

  useEffect(() => {
    window.electronAPI.on('message', (event: any, arg: any) => {
      showMessage(arg)
    })
    window.electronAPI.on('protocol', (event: any, data: any) => {
      const { file, content } = data
      const blob = new Blob([new Uint8Array(content)], { type: 'audio/mpeg' })
      const fileObj = new File([blob], path.basename(file), { type: 'audio/mpeg' })
      handleFiles([fileObj])
    })
    window.electronAPI.on('stemrollerDetected', () => {
      setDetectedDialogOpen(true)
    })
  }, [])

  return (
    <Box alignItems={'center'} display={'flex'} flexDirection={'column'}>
      <Image
        src={(isProd ? '/stemplayer' : '') + '/banner.png'}
        width={Object.keys(tracksObject).length > 3 ? 110 : 550}
        height={Object.keys(tracksObject).length > 3 ? 57.2 : 286}
        alt='banner'
        style={{
          marginBottom: Object.keys(tracksObject).length > 3 ? '1rem' : '3rem'
          // transition: 'all 1s ease'
        }}
      />
      <AddFiles inputRef={inputRef} handleFiles={handleFiles} onFileChange={onFileChange} />
      {/* {isLoading ? <p>Loading...</p> : <p>Loaded!</p>} */}
      <Box>
        {Object.entries(tracksObject).map(([song, tracks]) => (
          <Song
            key={song}
            song={song}
            tracks={tracks}
            expanded={expanded}
            handleExpand={handleExpand}
            tracksObject={tracksObject}
            isPlaying={isPlaying}
            setPlayed={setPlayed}
          />
        ))}
      </Box>
      {/* <Button onClick={() => showMessage('Hacked By Blade')}>Snackbar</Button> */}
      <MessageBar message={message} messageType={messageType} isOpen={messageOpen} />
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 50,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          background: '#111'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#111'
          }}
        >
          <a
            href='https://github.com/YeonV/stemplayer'
            target='_blank'
            rel='noopener noreferrer'
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <GitHub sx={{ mr: 1 }} />
            Open&nbsp;Source&nbsp;|&nbsp;by&nbsp;YeonV
          </a>
          <Image src={(isProd ? '/stemplayer' : '') + '/yz.png'} width={32} height={32} alt='logo' />

          <a
            href='https://github.com/YeonV/stemplayer/releases/latest'
            target='_blank'
            rel='noopener noreferrer'
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Download Desktop App
            <Download sx={{ ml: 1 }} />
          </a>
        </div>
      </footer>
      <DetectedDialog open={detectedDialogOpen} setOpen={setDetectedDialogOpen} />
    </Box>
  )
}
