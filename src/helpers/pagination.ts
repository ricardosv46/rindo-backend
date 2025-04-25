import { Model, FilterQuery, PopulateOptions } from 'mongoose'
import { convertToDate } from './date'

type ExtendedFilterQuery<T> = FilterQuery<T> & {
  dateFormat?: {
    $gte?: string
    $lte?: string
  }
  $or?: FilterQuery<T>[]
}

export interface FiltersPagination {
  search?: string
  from?: string
  to?: string
  pageSize?: number
  pageIndex?: number
}

export interface PaginationParams {
  search?: string
  from?: string
  to?: string
  pageSize?: number
  pageIndex?: number
  searchFields?: string[]
  populate?: PopulateOptions | PopulateOptions[] | Record<string, PopulateOptions>
}

export interface PaginationResult<T> {
  data: T[]
  pagination: {
    total: number
    pageSize: number
    currentPage: number
    totalPages: number
  }
}

export async function paginateWithFilters<T>(
  model: Model<T>,
  baseFilter: FilterQuery<T>,
  { search = '', from = '', to = '', pageSize = 10, pageIndex = 1, searchFields = [], populate }: PaginationParams
): Promise<PaginationResult<T>> {
  const filter: ExtendedFilterQuery<T> = { ...baseFilter }
  const dateFormat: any = {}

  // Agregar filtro de fechas si existe al menos una fecha
  if (from?.trim() || to?.trim()) {
    const fromDateStr = from?.trim() ? decodeURIComponent(from.trim()) : null
    const toDateStr = to?.trim() ? decodeURIComponent(to.trim()) : null

    if (fromDateStr) {
      const startDate = convertToDate(fromDateStr)
      startDate.setUTCHours(0, 0, 0, 0)
      dateFormat.$gte = startDate.toISOString()
    }

    if (toDateStr) {
      const endDate = convertToDate(toDateStr)
      endDate.setUTCHours(23, 59, 59, 999)
      dateFormat.$lte = endDate.toISOString()
    }
  }

  // Agregar búsqueda si existe y no está vacía
  if (search && search.trim() !== '' && searchFields.length > 0) {
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: search, $options: 'i' }
    })) as FilterQuery<T>[]
  }

  if (dateFormat.$gte || dateFormat.$lte) {
    filter.dateFormat = { ...dateFormat }
  }

  // Obtener total de documentos para la paginación
  const total = await model.countDocuments(filter)
  const totalPages = Math.ceil(total / pageSize)

  // Obtener los documentos paginados
  let query = model
    .find(filter)
    .skip((pageIndex - 1) * pageSize)
    .limit(pageSize)
    .sort({ dateFormat: -1 })

  if (populate) {
    if (Array.isArray(populate)) {
      query = query.populate(populate)
    } else if (typeof populate === 'object' && !Array.isArray(populate)) {
      // Si es un objeto con múltiples populates
      Object.entries(populate).forEach(([path, options]) => {
        query = query.populate(path, options)
      })
    } else {
      query = query.populate(populate)
    }
  }

  const data = await query

  return {
    data,
    pagination: {
      total,
      pageSize,
      currentPage: pageIndex,
      totalPages
    }
  }
}
