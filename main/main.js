const { app, BrowserWindow, protocol, ipcMain } = require('electron')
const serve = require('electron-serve')
const fs = require('fs')
const path = require('path')
const Store = require('electron-store')
const store = new Store()
const { readFilesInDir, stripTrailingSlash } = require('./utils')

const homeDir = app.getPath('home')
const musicDir = path.join(homeDir, 'Music', 'StemRoller')
let win

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
  let { width, height } = store.get('windowBounds', { width: 800, height: 800 })

  win = new BrowserWindow({
    width,
    height,
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

    win.webContents.on('did-finish-load', () => {
      if (fs.existsSync(musicDir)) {
        console.log('Music directory exists')
        setTimeout(() => {
          win.webContents.send('stemrollerDetected', musicDir)
        }, 500)
        setTimeout(() => {
          win.webContents.send('stemrollerDetected', musicDir)
        }, 1500)
      } else {
        console.log('Music directory does not exist')
      }
    })
  }
  win.on('close', () => {
    let { width, height } = win.getBounds()
    store.set('windowBounds', { width, height })
  })
}
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'stemplayer',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true
      // stream: true,
      // corsEnabled: true,
    }
  }
])

const handleFolderPath = (inputPath) => {
  const folderPath = stripTrailingSlash(inputPath.slice('stemplayer://'.length))
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
  if (folderPath.split('=')[0] === 'message') {
    win.webContents.send('message', folderPath.split('=')[1])
  } else {
    readFilesInDir(win, folderPath)
  }
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    handleFolderPath(commandLine.pop())
  })
  app.whenReady().then(() => {
    createWindow()
  })
}

app.on('ready', () => {
  protocol.handle('stemplayer', (request) => {
    handleFolderPath(request.url)
  })
  if (!app.isDefaultProtocolClient('stemplayer')) {
    app.setAsDefaultProtocolClient('stemplayer')
  }
  app.removeAsDefaultProtocolClient('stemplayer')
  if (!app.isPackaged && process.platform === 'win32') {
    app.setAsDefaultProtocolClient('stemplayer', process.execPath, [path.resolve(process.argv[1])])
  } else {
    app.setAsDefaultProtocolClient('stemplayer')
  }

  ipcMain.on('import-all', () => {
    try {
      readFilesInDir(win, musicDir)
    } catch (error) {
      console.error(`Failed to read files in directory: ${error}`)
    }
  })
  ipcMain.on('get-stemroller', () => {
    win.webContents.send('got-stemroller', musicDir)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
