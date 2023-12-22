import { useEffect, useRef, useState } from 'react'
import { Box, Button, Slider, Stack, Typography, useTheme } from '@mui/material'
import { VolumeOff, VolumeUp } from '@mui/icons-material'
import { ITrack, TrackType } from '@/components/utils'

const Track = ({ track, trackType, disabled }: { track: ITrack; trackType: (typeof TrackType)[number]; disabled?: boolean }) => {
  const theme = useTheme()
  const [volume, setVolume] = useState(track.audio.volume * 100)
  const [mutedTracks, setMutedTracks] = useState({
    drums: false,
    bass: false,
    instrumental: false,
    vocals: false,
    other: false
  })
  const [soloed, setSoloed] = useState<string | false>(false)

  const handleVolChange = (event: any, newValue: number | number[]) => {
    const newVolume = newValue as number
    setVolume(newVolume)
    track.audio.volume = newVolume / 100
  }

  useEffect(() => {
    const solo = soloed === trackType
    const updatedMutedTracks = {} as any
    Object.keys(mutedTracks).forEach((key) => {
      updatedMutedTracks[key] = solo ? key !== trackType && mutedTracks[key as (typeof TrackType)[number]] : mutedTracks[key as (typeof TrackType)[number]]
    })
    setMutedTracks(updatedMutedTracks)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soloed, trackType])

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
          onClick={() => setSoloed((prevSolo) => (prevSolo === trackType ? false : trackType))}
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
