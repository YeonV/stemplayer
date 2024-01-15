import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Slider, Stack, Typography } from '@mui/material'
import { ExpandMore, PlayArrow, Stop } from '@mui/icons-material'
import { ITrack, TrackType, formatDuration, throttle } from '@/components/utils'
import Track from './Track'
import { useCallback, useEffect, useState } from 'react'

const Song = ({
  song,
  tracks,
  tracksObject,
  expanded,
  handleExpand,
  isPlaying,
  setPlayed,
  setTracksObject,
  disabled
}: {
  song: string
  tracks: Record<(typeof TrackType)[number], ITrack>
  tracksObject: Record<string, Record<(typeof TrackType)[number], ITrack>>
  expanded: string | false
  handleExpand: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void
  isPlaying: Record<string, boolean>
  setPlayed: React.Dispatch<React.SetStateAction<number>>
  setTracksObject: React.Dispatch<React.SetStateAction<Record<string, Record<(typeof TrackType)[number], ITrack>>>>
  disabled?: boolean
}) => {
  const name = song.split('-').slice(0, -1).join('-').replaceAll('(Official Video)', '').replaceAll(' - Official Video', '')
  const artist = name.split('\\').pop()?.split('-').slice(-1)[0] || name.split('-').slice(-1)[0]
  const title = name.split('\\').pop()?.split('-').slice(0, -1).join('-') || name.split('-').slice(0, -1).join('-')
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [soloed, setSoloed] = useState<string | false>(false)
  // console.log(tracksObject)
  const [mutedTracks, setMutedTracks] = useState({
    drums: false,
    bass: false,
    instrumental: false,
    vocals: false,
    other: false,
    master: false
  })
  const [volumes, setVolumes] = useState({
    drums: 50,
    bass: 50,
    instrumental: 50,
    vocals: 50,
    other: 50,
    master: 50
  })
  const stopAllTracks = useCallback(() => {
    Object.values(tracksObject).forEach((trackSet) => {
      Object.values(trackSet).forEach((track) => {
        if (!track?.audio) return
        track.audio.pause()
        track.audio.currentTime = 0
      })
    })
    setPlayed((p) => p + 1)
  }, [tracksObject, setPlayed])

  const playSong = useCallback(async () => {
    stopAllTracks()
    const playPromises = Object.values(tracksObject[song]).map((track) => {
      if (track?.audio) {
        track.audio.play()
        track.audio.addEventListener('ended', stopAllTracks)
        track.audio.addEventListener(
          'timeupdate',
          throttle(() => {
            setPosition(track.audio.currentTime)
          }, 1000)
        ) // Update position at most once per second
        setDuration(track.audio.duration)
        return track.audio.play()
      }
    })
    try {
      await Promise.all(playPromises)
    } catch (error) {
      console.error('Error playing tracks:', error)
    }
    setPlayed((p) => p + 1)
  }, [stopAllTracks, tracksObject, song, setPlayed])

  // const playSong = async () => {
  //   stopAllTracks()
  //   const trackTypes = Object.keys(tracksObject[song])
  //   for (const type of trackTypes) {
  //     const track = tracksObject[song][type as (typeof TrackType)[number]]
  //     if (!track.audio) {
  //       const audio = new Audio(track.path)
  //       audio.volume = 0.5
  //       audio.addEventListener('ended', stopAllTracks)
  //       audio.addEventListener(
  //         'timeupdate',
  //         throttle(() => {
  //           setPosition(audio.currentTime)
  //         }, 1000)
  //       )
  //       setTracksObject((o) => {
  //         return {
  //           ...o,
  //           [song]: {
  //             ...(o[song] || []),
  //             [type]: {
  //               ...track,
  //               audio: audio
  //             }
  //           }
  //         }
  //       })
  //       setDuration(audio.duration)
  //       audio.play()
  //     } else {
  //       track.audio.play()
  //     }
  //   }
  //   setPlayed((p) => p + 1)
  // }

  const handleButtonClick = (event: any) => {
    event.stopPropagation()
    isPlaying[song] ? stopAllTracks() : playSong()
  }

  useEffect(() => {
    if (soloed === false) {
      setMutedTracks({
        drums: false,
        bass: false,
        instrumental: false,
        vocals: false,
        other: false,
        master: false
      })
    } else {
      setMutedTracks({
        drums: soloed !== 'drums',
        bass: soloed !== 'bass',
        instrumental: soloed !== 'instrumental',
        vocals: soloed !== 'vocals',
        other: soloed !== 'other',
        master: false
      })
    }
  }, [soloed])

  return (
    <Accordion expanded={expanded === song} onChange={handleExpand(song)} sx={{ minWidth: 600 }}>
      <AccordionSummary expandIcon={<ExpandMore />} aria-controls='panel1a-content' id={song}>
        <Stack direction={'row'} alignItems={'center'}>
          <Button
            disabled={disabled}
            variant={Object.keys(isPlaying).some((p) => isPlaying[p]) && !isPlaying[song] ? 'outlined' : 'contained'}
            color={isPlaying[song] ? 'secondary' : 'primary'}
            onClick={handleButtonClick}
            sx={{ mr: 3, minWidth: 85 }}
          >
            {isPlaying[song] ? <Stop /> : <PlayArrow />}
          </Button>
          <Typography>
            <b>{artist}</b> - {title}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack direction={'column'} flexGrow={1}>
          <Stack direction={'row'} alignItems={'center'} sx={{ p: '0 16px 16px 2px' }}>
            <div style={{ paddingRight: '1rem' }}>{formatDuration(position)}</div>
            <Slider
              color='info'
              disabled={!isPlaying[song]}
              value={position}
              max={duration}
              onChange={(event, newValue) => {
                if (typeof newValue === 'number') {
                  setPosition(newValue)
                  Object.values(tracksObject[song]).forEach((track) => {
                    track.audio.currentTime = newValue
                  })
                }
              }}
            />
            <div style={{ paddingLeft: '1rem' }}>{formatDuration(duration)}</div>
          </Stack>
          {tracks &&
            Object.entries(tracks).map(([type, track]) => (
              <Track
                disabled={!isPlaying[song]}
                key={type}
                track={track}
                trackType={type as (typeof TrackType)[number]}
                soloed={soloed}
                setSoloed={setSoloed}
                mutedTracks={mutedTracks}
                setMutedTracks={setMutedTracks}
                tracksObject={tracksObject}
                volume={volumes[type as (typeof TrackType)[number]]}
                setVolume={(volume) => {
                  setVolumes((prevVolumes) => ({
                    ...prevVolumes,
                    [type]: volume
                  }))
                }}
              />
            ))}
          <Track
            disabled={!isPlaying[song]}
            tracksObject={tracksObject}
            key='master'
            track={{ audio: new Audio() }} // Dummy track for the master control
            trackType='master'
            soloed={soloed}
            setSoloed={setSoloed}
            mutedTracks={mutedTracks}
            setMutedTracks={setMutedTracks}
            volume={volumes.master}
            setVolume={(volume) => {
              setVolumes((prevVolumes) => {
                const newVolumes = { ...prevVolumes } as any
                Object.keys(newVolumes).forEach((trackType) => {
                  newVolumes[trackType as (typeof TrackType)[number]] = volume
                })
                return newVolumes
              })
            }}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

export default Song
