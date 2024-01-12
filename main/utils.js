const fs = require('fs')
const path = require('path')

function readFilesInDir(win, dirPath) {
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
          try {
            readFilesInDir(win, filePath)
          } catch (error) {
            console.error(`Failed to read files in directory: ${error}`)
          }
        }
      })
    })
  })
}

const stripTrailingSlash = (str) => {
  return str.endsWith('/') ? str.slice(0, -1) : str
}

module.exports = {
  readFilesInDir,
  stripTrailingSlash
}
