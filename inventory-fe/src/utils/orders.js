/* createdAt is an ISO string, so text order is time order. */
export const newestFirst = (orders) =>
  [...orders].sort(
    (a, b) => String(b.createdAt).localeCompare(String(a.createdAt)) || b.id - a.id,
  );
