import axios from 'axios'

export interface IGetVouchers {
  ruc: string
  serie: string
  token: string
}

export const getVouchers = async ({ ruc, serie, token }: IGetVouchers): Promise<any> => {
  try {
    let apiResponse = null
    const numSerie = serie?.split('-')[0]?.trim()
    const numCpe = serie?.split('-')[1]?.trim()
    const { data: apiResponseFacturas } = await axios.post('https://server-datafact.analytia.pe/api/consult', {
      serie: numSerie,
      number: numCpe,
      rucEmisor: ruc,
      token
    })

    if (typeof apiResponseFacturas.data !== 'string' && !apiResponseFacturas.error) {
      apiResponse = apiResponseFacturas
    } else {
      const { data: apiResponseRxh } = await axios.post('https://server-datafact.analytia.pe/api/consult-rh', {
        serie: numSerie,
        number: numCpe,
        rucEmisor: ruc,
        token
      })

      if (apiResponseRxh.data) {
        apiResponse = apiResponseRxh
      } else {
        apiResponse = null
      }
    }

    return apiResponse
  } catch (error) {
    console.log({ error })
  }
}

export interface IGetRuc {
  ruc: string
}

export const getCompanySunat = async ({ ruc }: IGetRuc) => {
  try {
    const token = process.env.TOKEN_CONSULT_RUC
    const { data } = await axios.get(`https://server-dniruc.analytia.pe/api/ruc/${ruc}/${token}`)
    return data
  } catch (error) {
    console.log({ error })
  }
}
