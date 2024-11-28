import multer from 'multer'
import path from 'path'

const diskStorage = multer.diskStorage({
  destination: path.join(__dirname, '../files'),
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})

export const fileUpload = multer({
  storage: diskStorage
}).single('file')
