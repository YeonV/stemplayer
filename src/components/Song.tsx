import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Slider, Stack, Typography } from '@mui/material'
import { ExpandMore, PlayArrow, Stop } from '@mui/icons-material'
import { ITrack, TrackType, formatDuration, throttle } from '@/components/utils'
import Track from './Track'
import { useState } from 'react'

const Song = ({
  song,
  tracks,
  tracksObject,
  expanded,
  handleExpand,
  isPlaying,
  setPlayed
}: {
  song: string
  tracks: Record<(typeof TrackType)[number], ITrack>
  tracksObject: Record<string, Record<(typeof TrackType)[number], ITrack>>
  expanded: string | false
  handleExpand: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void
  isPlaying: Record<string, boolean>
  setPlayed: React.Dispatch<React.SetStateAction<number>>
}) => {
  const name = song.split('-').slice(0, -1).join('-').replaceAll('(Official Video)', '').replaceAll(' - Official Video', '')
  const artist = name.split('-').slice(-1)[0]
  const title = name.split('-').slice(0, -1).join('-')
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)

  const playAllTracks = async () => {
    stopAllTracks()
    const playPromises = Object.values(tracksObject[song]).map((track) => {
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
    })
    await Promise.all(playPromises)
    setPlayed((p) => p + 1)
  }

  const stopAllTracks = () => {
    Object.values(tracksObject).forEach((trackSet) => {
      Object.values(trackSet).forEach((track) => {
        track.audio.pause()
        track.audio.currentTime = 0
      })
    })
    setPlayed((p) => p + 1)
  }

  return (
    <Accordion expanded={expanded === song} onChange={handleExpand(song)} sx={{ minWidth: 600 }}>
      <AccordionSummary expandIcon={<ExpandMore />} aria-controls='panel1a-content' id={song}>
        <Stack direction={'row'} alignItems={'center'}>
          <Button
            variant={Object.keys(isPlaying).some((p) => isPlaying[p]) && !isPlaying[song] ? 'outlined' : 'contained'}
            color={isPlaying[song] ? 'secondary' : 'primary'}
            onClick={(e) => {
              e.stopPropagation()
              isPlaying[song] ? stopAllTracks() : playAllTracks()
            }}
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
          <Box sx={{ p: 2 }}>
            <Slider
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
            <div>
              {formatDuration(position)} / {formatDuration(duration)}
            </div>
          </Box>
          {tracks &&
            Object.entries(tracks).map(([type, track]) => (
              <Track disabled={!isPlaying[song]} key={type} track={track} trackType={type as (typeof TrackType)[number]} />
            ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

export default Song
