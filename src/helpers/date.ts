import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'

dayjs.extend(customParseFormat)
dayjs.extend(utc)

/**
 * Convierte una fecha en formato DD/MM/YYYY a un objeto Date
 * @param dateString Fecha en formato DD/MM/YYYY
 * @returns Objeto Date
 */
export const convertToDate = (dateString: string): Date => {
  const [day, month, year] = dateString.split('/')
  return new Date(Number(year), Number(month) - 1, Number(day))
}
