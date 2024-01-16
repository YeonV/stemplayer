import { useEffect, useRef, useState } from 'react'
import { Box, Button, CircularProgress, LinearProgress } from '@mui/material'
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
  const [tracksObject, setTracksObject] = useState<Record<string, Record<(typeof TrackType)[number], ITrack>>>({})
  const tracksObjectRef = useRef(tracksObject)
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
  const songsImported = useRef(0)
  const songsTotal = useRef(0)
  let timer = null as any

  function logDone() {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      setIsLoading(false)
      timer = null
    }, 1000)
  }

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

  const handleFiles = async (files: any, drop?: boolean, yzdir?: any, protocol?: boolean) => {
    setIsLoading(true)
    if (files.length === 0) {
      setIsLoading(false)
      return
    }

    const promises = (files.constructor.name == 'Array' ? files : Object.values(files)).map(
      (file: any) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = function (eb: any) {
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
              const output = {
                ...tracksObjectRef.current,
                [song]: {
                  ...(tracksObjectRef.current[song] || []),
                  [t]: {
                    path: file.webkitRelativePath,
                    audio: audio
                  }
                }
              }
              tracksObjectRef.current = output
            } else {
              const filePath = file.path !== '' ? file.path : file.name
              const parsedPath = path.parse(filePath)
              const theSong = (parsedPath.dir || yzdir || parsedPath.name).includes('\\')
                ? (parsedPath.dir || yzdir || parsedPath.name).split('\\')
                : (parsedPath.dir || yzdir || parsedPath.name).split('/').pop()
              const songb =
                drop && !window?.electronAPI
                  ? theSong
                  : drop && window?.electronAPI
                  ? protocol
                    ? theSong.includes('\\')
                      ? theSong.split('\\').pop().slice(-2)[0]
                      : theSong.split('/').pop().slice(-2)[0]
                    : theSong.slice(-2)[0]
                  : theSong
              const song = songb.constructor.name === 'Array' ? songb.slice(-2)[1] : songb
              // const song = !!window?.electronAPI ? theSongb : theSongb
              console.log('isElectron', !!window?.electronAPI)
              console.log('SONG:', song)
              console.log('SONGB:', songb)
              const t = parsedPath.name.includes('\\') ? parsedPath.name.split('\\').pop() : parsedPath.name.split('/').pop()
              console.log('Stem:', t)
              let audio: any
              const existingAudio = tracksObject[song]?.[t as (typeof TrackType)[number]]?.audio
              if (existingAudio) {
                audio = existingAudio
              } else {
                audio = new Audio(eb.target.result)
              }
              audio.volume = 0.5
              const output = {
                ...tracksObjectRef.current,
                [song]: {
                  ...(tracksObjectRef.current[song] || []),
                  [t]: {
                    path: parsedPath.base,
                    audio: audio
                  }
                }
              }
              tracksObjectRef.current = output
            }
            // })
            resolve(true)
            setTracksObject(tracksObjectRef.current)
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
    )

    try {
      await Promise.all(promises)
    } catch (error) {
      console.error('Error reading files:', error)
    } finally {
      logDone()
    }
  }

  const onFileChange = (e: any) => {
    if (e.target.files) {
      console.log(e.target.files)
      if (e.target.files.constructor.name == 'Array') {
        if (e.target.files.length === 0) return
        handleFiles(e.target.files, false, null)
      } else {
        if (Object.values(e.target.files).length === 0) return
        handleFiles(Object.values(e.target.files), false, null)
      }
    }
  }

  const handleExpand = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

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
    if (!window?.electronAPI) return
    window.electronAPI.on('songs', (event: any, arg: any) => {
      const { currentIndex, total } = arg

      // console.log(currentIndex + 1 + '/' + total + ' songs imported', 'info')
      showMessage('Importing ' + (currentIndex + 1) + ' songs...', 'info')
      songsImported.current = currentIndex + 1
      songsTotal.current = total
    })
    window.electronAPI.on('message', (event: any, arg: any) => {
      showMessage(arg)
    })
    window.electronAPI.on('protocol', (event: any, data: any) => {
      const { file, content, yzdir } = data
      const blob = new Blob([new Uint8Array(content)], { type: 'audio/mpeg' })
      const fileObj = new File([blob], path.basename(file), { type: 'audio/mpeg' })
      handleFiles([fileObj], false, yzdir, true)
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

      <AddFiles inputRef={inputRef} handleFiles={handleFiles} onFileChange={onFileChange} />

      <Box>
        {Object.entries(tracksObject).map(([song, tracks]) => (
          <Song
            key={song}
            disabled={isLoading}
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
      {isLoading ? (
        <Box sx={{ width: '100%', textAlign: 'center', marginTop: '1rem' }}>
          <Image src={(isProd ? '/stemplayer' : '') + '/loading.gif'} width={32} height={32} alt='logo' />
        </Box>
      ) : (
        Object.keys(tracksObject).length === 0 &&
        detected && (
          <Button startIcon={<PlayForWork />} size='large' variant='contained' onClick={() => window.electronAPI.send('import-all')} sx={{ mb: 2 }}>
            Load Stem Roller Folder
          </Button>
        )
      )}
      <Footer />
      <MessageBar message={message} messageType={messageType} isOpen={messageOpen} />
      <DetectedDialog open={detectedDialogOpen} setOpen={setDetectedDialogOpen} />
    </Box>
  )
}
