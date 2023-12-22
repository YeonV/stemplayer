import { useEffect, useState } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Button, Stack, Typography } from '@mui/material'
import { ExpandMore, PlayArrow, Stop } from '@mui/icons-material'
import { ITrack, TrackType } from '@/components/utils'
import Track from './Track'

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

  const playAllTracks = async () => {
    stopAllTracks()
    const playPromises = [
      tracksObject[song].drums.audio.play(),
      tracksObject[song].bass.audio.play(),
      tracksObject[song].instrumental.audio.play(),
      tracksObject[song].vocals.audio.play(),
      tracksObject[song].other.audio.play()
    ]
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
