export interface FiltersDTO {
  search?: string
  from?: string
  to?: string
  pageSize?: number
  pageIndex?: number
}

export const filtersDTO = (props: any): FiltersDTO => {
  return {
    search: props.search as string,
    from: props.from as string,
    to: props.to as string,
    pageSize: Number(props.pageSize),
    pageIndex: Number(props.pageIndex)
  }
}
