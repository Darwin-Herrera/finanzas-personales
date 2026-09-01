export const currency = (value, code = 'HNL') =>
  new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
  }).format(Number(value || 0))

export const monthKey = (date = new Date()) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export const firstDayOfMonth = (key) => `${key}-01`

export const lastDayOfMonth = (key) => {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month, 0).toISOString().slice(0, 10)
}

export const toHnl = (amount, currencyCode, exchangeRate) => {
  const value = Number(amount || 0)
  if (currencyCode === 'HNL') return value
  return value * Number(exchangeRate || 1)
}
