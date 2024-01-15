// const fs = require('fs')
const fs = require('fs').promises
const path = require('path')

// function readFilesInDir(win, dirPath) {
//   fs.readdir(dirPath, (err, files) => {
//     if (err) {
//       console.error('Could not list the directory.', err)
//       process.exit(1)
//     }
//     files.forEach((file) => {
//       const filePath = path.join(dirPath, file)
//       fs.stat(filePath, (err, stat) => {
//         if (err) {
//           console.error('Error stating file.', err)
//           return
//         }
//         if (stat.isFile()) {
//           fs.readFile(filePath, (err, data) => {
//             if (err) {
//               console.error('Error reading file.', err)
//               return
//             }
//             win.webContents.send('protocol', { file: filePath, content: data })
//           })
//         } else if (stat.isDirectory()) {
//           try {
//             readFilesInDir(win, filePath)
//           } catch (error) {
//             console.error(`Failed to read files in directory: ${error}`)
//           }
//         }
//       })
//     })
//   })
// }

// async function readFilesInDir(win, dirPath) {
//   try {
//     const files = await fs.readdir(dirPath)
//     for (const file of files) {
//       const filePath = path.join(dirPath, file)
//       const stat = await fs.stat(filePath)
//       if (stat.isFile()) {
//         const data = await fs.readFile(filePath)
//         win.webContents.send('protocol', { file: filePath, content: data })
//       } else if (stat.isDirectory()) {
//         await readFilesInDir(win, filePath)
//       }
//     }
//   } catch (error) {
//     console.error(`Failed to read files in directory: ${error}`)
//   }
// }

async function readFilesInDir(win, dirPath) {
  try {
    dirPath = path.resolve(dirPath); // Ensure dirPath is an absolute path
    const files = await fs.readdir(dirPath)
    for (const [index, file] of files.entries()) {
      const filePath = path.join(dirPath, file)
      const stat = await fs.stat(filePath)
      if (stat.isDirectory()) {
        const subFiles = await fs.readdir(filePath)
        for (const subFile of subFiles) {
          const subFilePath = path.join(filePath, subFile)
          const data = await fs.readFile(subFilePath)
          subFilePath.dir = filePath
          win.webContents.send('protocol', { file: subFilePath, content: data, yzdir: filePath })
        }
      }
      win.webContents.send('songs', { currentIndex: index, total: files.length })
    }
  } catch (error) {
    console.error(`Failed to read files in directory: ${error}`)
  }
}

const stripTrailingSlash = (str) => {
  return str.endsWith('/') ? str.slice(0, -1) : str
}

module.exports = {
  readFilesInDir,
  stripTrailingSlash
}
