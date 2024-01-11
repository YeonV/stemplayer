const { app, BrowserWindow, protocol, net, session, dialog } = require('electron')
const serve = require('electron-serve')
const path = require('path')
const url = require('url')

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('stemplayer', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('stemplayer')
}

const appServe = app.isPackaged
  ? serve({
      directory: path.join(__dirname, '../out')
    })
  : null

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (app.isPackaged) {
    appServe(win).then(() => {
      win.loadURL('app://-')
    })
  } else {
    win.loadURL('http://localhost:3000')
    win.webContents.openDevTools()
    win.webContents.on('did-fail-load', (e, code, desc) => {
      win.webContents.reloadIgnoringCache()
    })
  }
}
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'stemplayer',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true // Add this if you want to use fetch with this protocol.
      // stream: true, // Add this if you intend to use the protocol for streaming i.e. in video/audio html tags.
      // corsEnabled: true, // Add this if you need to enable cors for this protocol.
    }
  }
])
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    // the commandLine is array of strings in which last element is deep link url
    dialog.showErrorBox('Welcome Back', `You arrived from: ${commandLine.pop()}`)
  })

  // Create mainWindow, load the rest of the app, etc...
  app.whenReady().then(() => {
    createWindow()
  })
}

app.on('ready', () => {
  // const partition = 'persist:example'
  // const ses = session.fromPartition(partition)
  protocol.handle('stemplayer', (request) => {
    console.log(request)
    const parsedUrl = url.parse(request.url)
    const filePath = decodeURIComponent(parsedUrl.pathname)
    return dialog.showMessageBox({ message: filePath })

    // const filePath = request.url.slice('stemplayer://'.length)
    // return dialog.showMessageBox({ message: filePath })
    // return dialog.showErrorBox(`stemplayer ${filePath}`)
  })
  if (!app.isDefaultProtocolClient('stemplayer')) {
    app.setAsDefaultProtocolClient('stemplayer')
  }

  // remove so we can register each time as we run the app.
  app.removeAsDefaultProtocolClient('stemplayer')

  // If we are running a non-packaged version of the app && on windows
  if (process.env.NODE_ENV === 'development' && process.platform === 'win32') {
    // Set the path of electron.exe and your app.
    // These two additional parameters are only available on windows.
    app.setAsDefaultProtocolClient('stemplayer', process.execPath, [path.resolve(process.argv[1])])
  } else {
    app.setAsDefaultProtocolClient('stemplayer')
  }
  // app.setAsDefaultProtocolClient('stemplayer')

  // createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
