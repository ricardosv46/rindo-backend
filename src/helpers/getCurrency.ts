export const getCurrency = (currency: string) => {
  if (currency === 'SOLES') {
    return 'PEN'
  } else if (currency === 'DOLARES') {
    return 'USD'
  } else {
    return currency
  }
}
