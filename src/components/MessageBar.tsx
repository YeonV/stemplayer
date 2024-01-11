import { Icon, IconButton, Snackbar, Alert, AlertColor } from '@mui/material'

const MessageBar = ({
  message,
  messageType,
  isOpen,
  clearSnackbar
}: {
  message: string
  messageType: AlertColor | undefined
  isOpen?: boolean
  clearSnackbar?: any
}) => {
  function handleClose() {
    clearSnackbar?.()
  }

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      open={isOpen}
      autoHideDuration={2000 + (message.length || 0) * 60}
      onClose={() => handleClose()}
      aria-describedby='client-snackbar'
      action={[
        <IconButton key='close' aria-label='close' color='inherit' onClick={() => handleClose()}>
          <Icon>close</Icon>
        </IconButton>
      ]}
    >
      <Alert elevation={6} variant='filled' severity={messageType as AlertColor}>
        {message}
      </Alert>
    </Snackbar>
  )
}

export default MessageBar
