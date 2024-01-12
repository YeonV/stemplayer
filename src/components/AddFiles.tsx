import { Button, Stack, useTheme } from '@mui/material'
import { CreateNewFolder } from '@mui/icons-material'
import { RefObject, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export default function AddFiles({
  inputRef,
  handleFiles,
  onFileChange
}: {
  inputRef: RefObject<HTMLInputElement>
  onFileChange: (e: any) => void
  handleFiles: (e: any) => void
}) {
  const theme = useTheme()
  const onDrop = useCallback((acceptedFiles: any) => {
    handleFiles(acceptedFiles)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <Stack direction={'row'} width={600} justifyContent={'space-between'}>
      <Button
        startIcon={<CreateNewFolder />}
        size='large'
        variant='outlined'
        color='inherit'
        onClick={() => inputRef.current?.click()}
        sx={{ mb: 2, width: 292 }}
      >
        Select Folder
      </Button>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <div
          style={{
            height: '70px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 292,
            border: `${isDragActive ? '3' : '2'}px dashed ${isDragActive ? theme.palette.primary.main : '#eee'}`,
            color: isDragActive ? theme.palette.primary.main : '#eee',
            borderRadius: '5px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          Drop Folder
        </div>
      </div>
      {/* 
      //@ts-ignore */}
      <input ref={inputRef} onChange={onFileChange} type='file' accept='audio/*' id='input' webkitdirectory='true' mozdirectory='true' hidden />
    </Stack>
  )
}
