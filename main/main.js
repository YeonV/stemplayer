const { app, BrowserWindow, protocol, ipcMain } = require('electron')
const serve = require('electron-serve')
const path = require('path')
const fs = require('fs')

let win

const stripTrailingSlash = (str) => {
  return str.endsWith('/') ? str.slice(0, -1) : str
}
function readFilesInDir(dirPath) {
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error('Could not list the directory.', err)
      process.exit(1)
    }

    files.forEach((file) => {
      const filePath = path.join(dirPath, file)
      fs.stat(filePath, (err, stat) => {
        if (err) {
          console.error('Error stating file.', err)
          return
        }

        if (stat.isFile()) {
          fs.readFile(filePath, (err, data) => {
            if (err) {
              console.error('Error reading file.', err)
              return
            }
            win.webContents.send('protocol', { file: filePath, content: data })
          })
        } else if (stat.isDirectory()) {
          readFilesInDir(filePath) // Recursively read files in subdirectory
        }
      })
    })
  })
}

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
  win = new BrowserWindow({
    width: 800,
    height: 800,
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
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
    const folderPath = stripTrailingSlash(commandLine.pop().slice('stemplayer://'.length))
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
    if (folderPath.split('=')[0] === 'message') {
      win.webContents.send('message', folderPath.split('=')[1])
    } else {
      readFilesInDir(folderPath)
    }
  })

  // Create mainWindow, load the rest of the app, etc...
  app.whenReady().then(() => {
    createWindow()
  })
}

app.on('ready', () => {
  const mode = process.env.npm_lifecycle_event
  const homeDir = app.getPath('home')
  const musicDir = path.join(homeDir, 'Music', 'StemRoller')

  console.log('Mode:', mode)
  console.log('HomePath:', homeDir)
  console.log('MusicPath:', musicDir)
  protocol.handle('stemplayer', (request) => {
    const folderPath = stripTrailingSlash(request.url.slice('stemplayer://'.length))
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
    if (folderPath.split('=')[0] === 'message') {
      win.webContents.send('message', folderPath.split('=')[1])
    } else {
      readFilesInDir(folderPath)
    }
  })
  if (!app.isDefaultProtocolClient('stemplayer')) {
    app.setAsDefaultProtocolClient('stemplayer')
  }

  // remove so we can register each time as we run the app.
  app.removeAsDefaultProtocolClient('stemplayer')

  // If we are running a non-packaged version of the app && on windows
  if (!app.isPackaged && process.platform === 'win32') {
    // Set the path of electron.exe and your app.
    // These two additional parameters are only available on windows.
    app.setAsDefaultProtocolClient('stemplayer', process.execPath, [path.resolve(process.argv[1])])
  } else {
    app.setAsDefaultProtocolClient('stemplayer')
  }

  if (fs.existsSync(musicDir)) {
    console.log('Music directory exists')
    setTimeout(() => {
      win.webContents.send('stemrollerDetected')
    }, 5000)
  } else {
    console.log('Music directory does not exist')
  }

  ipcMain.on('import-all', () => {
    readFilesInDir(musicDir)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
