import multer, { StorageEngine } from 'multer'
import path from 'path'

const getExt = (nombreArchivo: string): string => {
  return path.extname(nombreArchivo).toLowerCase()
}

const randomName = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''

  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

const diskStorage: StorageEngine = multer.diskStorage({
  destination: path.join(__dirname, '../files'),
  filename: (req, file, cb) => {
    cb(null, `File_${Date.now()}_${randomName()}${getExt(file.originalname)}`)
  }
})

export const multipleFileUpload = multer({
  storage: diskStorage
}).fields([
  {
    name: 'file',
    maxCount: 1
  },
  {
    name: 'fileVisa',
    maxCount: 1
  },
  {
    name: 'fileRxh',
    maxCount: 1
  }
])
