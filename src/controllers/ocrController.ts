import { deleteFile, uploadFile } from '../helpers/s3'
import { Request, Response } from 'express'
import AWS from 'aws-sdk'
import { AWS_ACCESS_KEY, AWS_REGION, AWS_SECRET_KEY2, RUC } from '../config/credentialsS3'
import { MulterFiles } from './expenseController'
import { responseData, responseError } from '../helpers/response'
import { getCompanySunat, getVouchers } from '../helpers/apis'
import { Mistral } from '@mistralai/mistralai'
import { promptMistralIA } from '../helpers/prompt'
import { getCurrency } from '../helpers/getCurrency'

export const getOcrData = async (req: Request, res: Response) => {
  try {
    const files = req.files as unknown as MulterFiles

    const fileUpload = files?.file
    let file: string = ''

    if (fileUpload) {
      const upload = await uploadFile(fileUpload[0])
      file = upload?.Location || ''
    }

    AWS.config.update({
      region: AWS_REGION,
      accessKeyId: AWS_ACCESS_KEY,
      secretAccessKey: AWS_SECRET_KEY2
    })

    const lambda = new AWS.Lambda()
    const params = {
      FunctionName: 'ocr-rindefacil',
      InvocationType: 'RequestResponse',
      LogType: 'Tail',
      Payload: JSON.stringify({
        url: `${file}`,
        ruc: RUC
      })
    }

    const dataLambda = await lambda.invoke(params).promise()
    const ocr = JSON.parse(dataLambda?.Payload?.toString() ?? '{}')

    const rucEmisor = ocr?.data?.rucEmisor

    const companySunat = await getCompanySunat({ ruc: rucEmisor })
    if (companySunat?.data?.estado !== 'ACTIVO' && companySunat?.data?.estado !== 'HABIDO') {
      responseError('La empresa receptora debe estar activa y habida para que puedes rendir tus gastos', 400)
    }

    const token = req.user?.company?.token!

    const voucher = await getVouchers({ ruc: rucEmisor, serie: ocr?.serie, token })
    let content = ''

    if (voucher && ocr.documento !== 'RECIBO POR HONORARIOS ELECTRONICO') {
      content = voucher?.data?.informacion_items.map((i) => i.descripcion_item).join(',')
    } else {
      content = ocr?.data?.descripcion
    }

    await deleteFile(file)
    const ruc = req?.user?.company?.ruc
    const rucReceptorVoucher = voucher?.data?.ruc_receptor
    const rucReceptorOCr = ocr?.data?.rucReceptor

    if (rucReceptorVoucher !== ruc && rucReceptorOCr !== ruc) {
      responseError('El gasto no corresponde a la empresa', 400)
    }
    const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY })
    const mistralResponse = await client.chat.complete({
      model: 'mistral-large-latest',
      responseFormat: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: promptMistralIA
        },
        { role: 'user', content }
      ]
    })

    const responseMistral = mistralResponse.choices!

    const chatResult = responseMistral[0]?.message?.content! as string
    const cleanChatResult = chatResult?.replace(/```json|```/g, '').trim()
    const dataJson = JSON.parse(cleanChatResult)
    const data = {
      typeDocument: ocr?.documento,
      description: dataJson?.description ?? ocr?.data?.descripcion,

      serie: ocr?.serie,
      ruc: companySunat?.data?.ruc ?? rucEmisor,
      companyName: ocr?.data?.razSocialEmisor,
      category: dataJson?.category,
      rus: companySunat?.data?.afecto_rus === 'SI',

      total: voucher?.montos?.monto_total_recibido ?? ocr?.data?.importeTotal,
      retention: voucher?.montos?.monto_retencion ?? 0,
      currency: voucher?.codigo_moneda ?? getCurrency(ocr?.data?.moneda),
      date: voucher?.fecha_emision ?? ocr?.data?.fechaEmision
    }

    res.json(responseData(true, 'OCR y Mistral', data))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}
