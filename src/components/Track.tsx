import { useEffect, useState } from 'react'
import { Box, Button, Slider, Stack, Typography, useTheme } from '@mui/material'
import { VolumeOff, VolumeUp } from '@mui/icons-material'
import { ITrack, TrackType } from '@/components/utils'

const Track = ({
  track,
  trackType,
  disabled,
  soloed,
  setSoloed,
  mutedTracks,
  setMutedTracks,
  tracksObject,
  volume,
  setVolume
}: {
  track: ITrack
  trackType: (typeof TrackType)[number]
  disabled?: boolean
  soloed?: string | false
  setSoloed: React.Dispatch<React.SetStateAction<string | false>>
  mutedTracks: Record<(typeof TrackType)[number], boolean>
  setMutedTracks: React.Dispatch<React.SetStateAction<Record<(typeof TrackType)[number], boolean>>>
  tracksObject: Record<string, Record<(typeof TrackType)[number], ITrack>>
  volume: number
  setVolume: React.Dispatch<React.SetStateAction<number>>
}) => {
  const theme = useTheme()
  const handleVolChange = (event: any, newValue: number | number[]) => {
    const newVolume = newValue as number
    setVolume(newVolume)

    if (trackType === 'master') {
      // If this is the master track, change volume for all tracks
      Object.values(tracksObject).forEach((trackSet) => {
        Object.values(trackSet).forEach((ctrack) => {
          ctrack.audio.volume = newVolume / 100
        })
      })
    } else {
      // If this is not the master track, only change volume for this track
      track.audio.volume = newVolume / 100
    }
  }

  useEffect(() => {
    if (!track?.audio) return
    track.audio.muted = mutedTracks[trackType]
  }, [mutedTracks, track.audio, trackType])

  return (
    <Stack direction={'row'} justifyContent={'space-between'} marginBottom={1}>
      <Stack direction={'row'} alignItems={'center'} spacing={0.5} sx={{ color: '#999' }}>
        <Button
          disabled={disabled}
          variant={mutedTracks[trackType] ? 'contained' : 'outlined'}
          color={mutedTracks[trackType] ? 'error' : 'inherit'}
          onClick={() => {
            if (trackType === 'master') {
              // If this is the master track, mute/unmute all tracks
              setMutedTracks((prevMutedTracks) => {
                const newMutedTracks = { ...prevMutedTracks }
                for (const type in newMutedTracks) {
                  newMutedTracks[type as (typeof TrackType)[number]] = !prevMutedTracks[trackType]
                }
                return newMutedTracks
              })
            } else {
              // If this is not the master track, only mute/unmute this track
              setMutedTracks((prevMutedTracks) => ({
                ...prevMutedTracks,
                [trackType]: !prevMutedTracks[trackType]
              }))
            }
            setSoloed(false)
          }}
          sx={{ p: 0, minWidth: trackType !== 'master' ? 40 : 85 }}
        >
          {mutedTracks[trackType] ? <VolumeOff /> : <VolumeUp />}
        </Button>
        {trackType !== 'master' && (
          <Button
            disabled={disabled}
            variant={soloed ? 'contained' : 'outlined'}
            color={soloed === trackType ? 'primary' : 'inherit'}
            sx={{ p: 0, minWidth: 40 }}
            onClick={() => {
              if (soloed === trackType) {
                setSoloed(false)
              } else {
                setSoloed(trackType)
              }
            }}
          >
            S
          </Button>
        )}

        <Typography textTransform={'capitalize'} color={disabled ? theme.palette.text.disabled : '#fff'} sx={{ paddingLeft: 3 }}>
          {trackType}
        </Typography>
      </Stack>
      <Box sx={{ width: 320, pr: 2 }}>
        <Slider disabled={disabled} aria-label='Volume' valueLabelDisplay='auto' value={volume} onChange={handleVolChange} color='info' />
      </Box>
      <p style={{ display: 'none' }}>{track.path}</p>
    </Stack>
  )
}

export default Track
