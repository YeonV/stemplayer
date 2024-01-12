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
  setMutedTracks
}: {
  track: ITrack
  trackType: (typeof TrackType)[number]
  disabled?: boolean
  soloed?: string | false
  setSoloed: React.Dispatch<React.SetStateAction<string | false>>
  mutedTracks: Record<(typeof TrackType)[number], boolean>
  setMutedTracks: React.Dispatch<React.SetStateAction<Record<(typeof TrackType)[number], boolean>>>
}) => {
  const theme = useTheme()
  const [volume, setVolume] = useState(50)

  const handleVolChange = (event: any, newValue: number | number[]) => {
    const newVolume = newValue as number
    setVolume(newVolume)
    track.audio.volume = newVolume / 100
  }

  useEffect(() => {
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
            setMutedTracks((prevMutedTracks) => ({
              ...prevMutedTracks,
              [trackType]: !prevMutedTracks[trackType]
            }))
          }}
          sx={{ p: 0, minWidth: 40 }}
        >
          {mutedTracks[trackType] ? <VolumeOff /> : <VolumeUp />}
        </Button>
        <Button
          disabled={disabled}
          variant={soloed ? 'contained' : 'outlined'}
          color={soloed === trackType ? 'primary' : 'inherit'}
          onClick={() => {
            if (soloed === trackType) {
              // setMutedTracks({
              //   drums: false,
              //   bass: false,
              //   instrumental: false,
              //   vocals: false,
              //   other: false
              // })
              setSoloed(false)
            } else {
              // setMutedTracks({
              //   drums: soloed !== 'drums',
              //   bass: soloed !== 'bass',
              //   instrumental: soloed !== 'instrumental',
              //   vocals: soloed !== 'vocals',
              //   other: soloed !== 'other'
              // })
              setSoloed(trackType)
            }
          }}
          sx={{ p: 0, minWidth: 40 }}
        >
          S
        </Button>

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
