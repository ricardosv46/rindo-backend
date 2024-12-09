import { AWS_BUCKET_REGION, AWS_PUBLIC_KEY, AWS_SECRET_KEY, AWS_BUCKET_NAME } from '../config/credentialsS3'
import fs from 'fs'
import S3 from 'aws-sdk/clients/s3'
import dotenv from 'dotenv'
import { ReadStream } from 'fs'

dotenv.config()

const urlAWSS3 = process.env.URL_AWS!

const storage = new S3({
  region: AWS_BUCKET_REGION,
  accessKeyId: AWS_PUBLIC_KEY,
  secretAccessKey: AWS_SECRET_KEY
})

interface File {
  filename: string
}

export async function uploadFile(file: File | null): Promise<S3.ManagedUpload.SendData | null> {
  try {
    if (!file) return null

    const ulrlocal = `./src/files/${file.filename}`
    const stream: ReadStream = fs.createReadStream(ulrlocal)

    const uploadParams: S3.PutObjectRequest = {
      Bucket: AWS_BUCKET_NAME!,
      Key: file.filename,
      Body: stream
    }

    const upload = await storage.upload(uploadParams).promise()

    fs.unlinkSync(ulrlocal)
    return upload
  } catch (error) {
    console.log({ error })
    return null
  }
}

export async function deleteFile(fileName: string): Promise<void | null> {
  if (!fileName) return null

  const newFileName = fileName.replace(urlAWSS3, '')
  const deleteParams: S3.DeleteObjectRequest = {
    Bucket: AWS_BUCKET_NAME!,
    Key: newFileName
  }

  try {
    await storage.deleteObject(deleteParams).promise()
    console.log(`Imagen ${newFileName} borrada de Amazon S3.`)
  } catch (err) {
    console.error(`Error al borrar la imagen ${newFileName} de Amazon S3:`, err)
    throw err
  }
}
