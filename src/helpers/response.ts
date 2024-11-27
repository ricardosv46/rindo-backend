export interface Response<T> {
  success: boolean
  message: string
  data: T | null
}

export const responseData = <T>(
  success: boolean = false,
  message: string = 'Ocurrió un error en el servidor',
  data: T | null = null
): Response<T> => {
  return { data, success, message }
}

export class CustomError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

export const responseError = (message: string = 'Ocurrio un error en el servidor', status: number = 500): never => {
  throw new CustomError(message, status)
}
