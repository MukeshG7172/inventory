const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const count = new Intl.NumberFormat('en-US');
const dateTime = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fullDateTime = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export const formatCurrency = (value) => currency.format(value);
export const formatCount = (value) => count.format(value);

/* The backend sends LocalDateTime, which has no zone and is read as local time. */
const formatWith = (formatter) => (value) => {
  const parsed = new Date(value);
  return value && !Number.isNaN(parsed.getTime()) ? formatter.format(parsed) : '—';
};

export const formatDate = formatWith(date);
export const formatDateTime = formatWith(dateTime);
export const formatDateTimeFull = formatWith(fullDateTime);

/* Stock below this counts as low; zero counts as out of stock. */
export const LOW_STOCK_THRESHOLD = 10;
