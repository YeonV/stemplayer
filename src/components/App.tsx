import { useEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'
import { ITrack, TrackType } from '@/components/utils'
import AddFiles from './AddFiles'
import Song from './Song'
import Image from 'next/image'
import { Download, GitHub } from '@mui/icons-material'

export default function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [trackPaths, setTrackPaths] = useState<string[]>([])
  const [tracksObject, setTracksObject] = useState<Record<string, Record<(typeof TrackType)[number], ITrack>>>({})
  const [expanded, setExpanded] = useState<string | false>(false)
  const [isPlaying, setIsPlaying] = useState({} as Record<string, boolean>)
  const [played, setPlayed] = useState(0)
  const isProd = process.env.NODE_ENV === 'production' && process.env.PROD_ENV === 'github'

  const handleFiles = (files: any, web?: boolean) => {
    for (const file of files) {
      setTrackPaths((p) => [...p, web ? file.webkitRelativePath : file.path])
      const reader = new FileReader()
      reader.onload = function (eb: any) {
        setTracksObject((o) => {
          if (file.webkitRelativePath && file.webkitRelativePath !== '') {
            // console.log(file.webkitRelativePath)
            const [base, song, type] = file.webkitRelativePath.split('/')
            const t = type.split('.')[0] as (typeof TrackType)[number]
            return {
              ...o,
              [song]: {
                ...(o[song] || []),
                [t]: {
                  path: file.webkitRelativePath,
                  audio: new Audio(eb.target.result)
                }
              }
            }
          } else {
            // console.log(file.path)
            const isWindows = file.path.includes('\\')
            const [base, song, type] = file.path.split(isWindows ? '\\' : '/').slice(-3)
            const t = type.split('.')[0] as (typeof TrackType)[number]
            return {
              ...o,
              [song]: {
                ...(o[song] || []),
                [t]: {
                  path: file.path,
                  audio: new Audio(eb.target.result)
                }
              }
            }
          }
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const onFileChange = (e: any) => {
    if (e.target.files) {
      handleFiles(e.target.files, true)
    }
  }

  const handleExpand = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  useEffect(() => {
    for (const path of trackPaths) {
      const isWindows = path.includes('\\')
      const [base, song, type] = path.split(isWindows ? '\\' : '/').slice(-3)
      const t = type.split('.')[0] as (typeof TrackType)[number]
      setTracksObject((o) => {
        const t = type.split('.')[0] as (typeof TrackType)[number]
        return {
          ...o,
          [song]: {
            ...(o[song] || []),
            [t]: {
              path,
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

  return (
    <Box alignItems={'center'} display={'flex'} flexDirection={'column'}>
      <Image src={(isProd ? '/stemplayer' : '') + '/banner.png'} width={550} height={286} alt='banner' style={{ marginBottom: '3rem' }} />
      <AddFiles inputRef={inputRef} handleFiles={handleFiles} onFileChange={onFileChange} />
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
    </Box>
  )
}
