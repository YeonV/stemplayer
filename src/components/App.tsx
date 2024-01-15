import { useEffect, useRef, useState } from 'react'
import { Box, Button } from '@mui/material'
import { ITrack, TrackType } from '@/components/utils'
import AddFiles from './AddFiles'
import Song from './Song'
import Image from 'next/image'
import MessageBar from './MessageBar'
import DetectedDialog from './DetectedDialog'
import Footer from './Footer'
import { PlayForWork } from '@mui/icons-material'
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
  const [detected, setDetected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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

  // const handleFiles = async (files: any, web?: boolean) => {
  //   setIsLoading(true)
  //   if (files.length === 0) return
  //   for (const file of files) {
  //     setTrackPaths((p) => [...p, web ? file.webkitRelativePath : file.path !== '' ? file.path : file.name])
  //     const reader = new FileReader()
  //     reader.onload = function (eb: any) {
  //       setTracksObject((o) => {
  //         if (file.webkitRelativePath && file.webkitRelativePath !== '') {
  //           const [base, song, type] = file.webkitRelativePath.split('/')
  //           const t = type.split('.')[0] as (typeof TrackType)[number]
  //           const audio = new Audio(eb.target.result)
  //           audio.volume = 0.5
  //           return {
  //             ...o,
  //             [song]: {
  //               ...(o[song] || []),
  //               [t]: {
  //                 path: file.webkitRelativePath,
  //                 audio: audio
  //               }
  //             }
  //           }
  //         } else {
  //           const isWindows = file.path.includes('\\') || file.name.includes('\\')
  //           const [base, song, type] = (file.path !== '' ? file.path : file.name).split(isWindows ? '\\' : '/').slice(-3)
  //           const t = type.split('.')[0] as (typeof TrackType)[number]
  //           const audio = new Audio(eb.target.result)
  //           audio.volume = 0.5
  //           return {
  //             ...o,
  //             [song]: {
  //               ...(o[song] || []),
  //               [t]: {
  //                 path: file.path,
  //                 audio: audio
  //               }
  //             }
  //           }
  //         }
  //       })
  //     }
  //     reader.readAsDataURL(file)
  //   }
  //   setIsLoading(false)
  // }
  const handleFiles = async (files: any, web?: boolean, yzdir?: any) => {
    // console.log(files, yzdir)
    setIsLoading(true)
    if (files.length === 0) {
      setIsLoading(false)
      return
    }

    const promises = files.map(
      (file: any) =>
        new Promise((resolve, reject) => {
          setTrackPaths((p) => [...p, web ? file.webkitRelativePath : file.path !== '' ? file.path : file.name])
          const reader = new FileReader()
          reader.onload = function (eb: any) {
            setTracksObject((o) => {
              if (file.webkitRelativePath && file.webkitRelativePath !== '') {
                const [base, song, type] = file.webkitRelativePath.split('/')
                const t = type.split('.')[0] as (typeof TrackType)[number]
                let audio: any
                const existingAudio = tracksObject[song]?.[t as (typeof TrackType)[number]]?.audio
                if (existingAudio) {
                  audio = existingAudio
                } else {
                  audio = new Audio(eb.target.result)
                }
                audio.volume = 0.5
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
                const filePath = file.path !== '' ? file.path : file.name
                const parsedPath = path.parse(filePath)
                const song = (parsedPath.dir || yzdir).includes('\\') ? (parsedPath.dir || yzdir).split('\\').pop() : (parsedPath.dir || yzdir).split('/').pop()
                const t = parsedPath.name.includes('\\') ? parsedPath.name.split('\\').pop() : parsedPath.name.split('/').pop()
                let audio: any
                const existingAudio = tracksObject[song]?.[t as (typeof TrackType)[number]]?.audio
                if (existingAudio) {
                  audio = existingAudio
                } else {
                  audio = new Audio(eb.target.result)
                }
                audio.volume = 0.5

                return {
                  ...o,
                  [song]: {
                    ...(o[song] || []),
                    [t]: {
                      path: parsedPath.base,
                      audio: audio
                    }
                  }
                }
              }
            })
            resolve(true)
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
    )

    try {
      await Promise.all(promises)
    } catch (error) {
      console.error('Error reading files:', error)
    }

    setIsLoading(false)
  }

  const onFileChange = (e: any) => {
    if (e.target.files) {
      handleFiles(e.target.files, true)
    }
  }

  const handleExpand = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  // useEffect(() => {
  //   if (trackPaths.length === 0) return
  //   for (const trackPath of trackPaths) {
  //     const isWindows = trackPath.includes('\\')
  //     const [base, song, type] = trackPath.split(isWindows ? '\\' : '/').slice(-3)
  //     const t = type.split('.')[0] as (typeof TrackType)[number]
  //     setTracksObject((o) => {
  //       const t = type.split('.')[0] as (typeof TrackType)[number]
  //       return {
  //         ...o,
  //         [song]: {
  //           ...(o[song] || []),
  //           [t]: {
  //             path: trackPath,
  //             audio: o[song]?.[t]?.audio || new Audio()
  //           }
  //         }
  //       }
  //     })
  //   }
  // }, [trackPaths])
  const [currentSong, setCurrentSong] = useState(null)
  console.log(tracksObject)
  useEffect(() => {
    if (trackPaths.length === 0) return
    for (const trackPath of trackPaths) {
      const parsedPath = path.parse(trackPath)
      let song = parsedPath.dir.split(path.sep).pop()
      // console.log(parsedPath, song)
      if (song !== '') {
        if (song.includes('\\')) {
          song = song.split('\\').pop()
        }
        console.log('YZ', song)
        setTracksObject((o) => {
          const t = parsedPath.name.split('\\').pop()

          return {
            ...o,
            [song]: {
              ...(o[song] || []),
              [t]: {
                path: trackPath,
                audio: o[song]?.[t as (typeof TrackType)[number]]?.audio || new Audio()
              }
            }
          }
        })
      }
    }
  }, [trackPaths, currentSong])

  useEffect(() => {
    const anyTrackPlaying = Object.keys(tracksObject).find((key) => {
      if (
        Object.values(tracksObject[key]).some((track) => {
          return !track.audio?.paused
        })
      )
        return key
    })
    setIsPlaying({ [anyTrackPlaying as any]: !!anyTrackPlaying })
  }, [tracksObject, played])

  useEffect(() => {
    if (!window.electronAPI) return
    window.electronAPI.on('songs', (event: any, arg: any) => {
      const { currentIndex, total } = arg
      console.log(currentIndex + 1 + '/' + total + ' songs imported', 'info')
      showMessage(currentIndex + 1 + '/' + total + ' songs imported', 'info')
    })
    window.electronAPI.on('message', (event: any, arg: any) => {
      showMessage(arg)
    })
    window.electronAPI.on('protocol', (event: any, data: any) => {
      const { file, content, yzdir } = data
      const blob = new Blob([new Uint8Array(content)], { type: 'audio/mpeg' })
      const fileObj = new File([blob], path.basename(file), { type: 'audio/mpeg' })
      handleFiles([fileObj], false, yzdir)
    })
    window.electronAPI.on('stemrollerDetected', () => {
      setDetectedDialogOpen(true)
      setDetected(true)
    })
  }, [])

  return (
    <Box alignItems={'center'} display={'flex'} flexDirection={'column'}>
      <Image
        priority
        src={(isProd ? '/stemplayer' : '') + '/banner.png'}
        width={Object.keys(tracksObject).length > 3 ? 110 : 550}
        height={Object.keys(tracksObject).length > 3 ? 57.2 : 286}
        alt='banner'
        style={{
          marginBottom: Object.keys(tracksObject).length > 3 ? '1rem' : '3rem'
        }}
      />
      <div>{isLoading ? 'Loading...' : 'loaded'}</div>
      <AddFiles inputRef={inputRef} handleFiles={handleFiles} onFileChange={onFileChange} />

      {Object.keys(tracksObject).length === 0 && detected && (
        <Button startIcon={<PlayForWork />} size='large' variant='contained' onClick={() => window.electronAPI.send('import-all')} sx={{ mb: 2 }}>
          Load Stem Roller Folder
        </Button>
      )}
      <Box>
        {Object.entries(tracksObject).map(([song, tracks]) => (
          <Song
            key={song}
            song={song}
            tracks={tracks}
            expanded={expanded}
            handleExpand={handleExpand}
            tracksObject={tracksObject}
            setTracksObject={setTracksObject}
            isPlaying={isPlaying}
            setPlayed={setPlayed}
          />
        ))}
      </Box>
      <Footer />
      <MessageBar message={message} messageType={messageType} isOpen={messageOpen} />
      <DetectedDialog open={detectedDialogOpen} setOpen={setDetectedDialogOpen} />
    </Box>
  )
}
