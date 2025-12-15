function getDateRange(range) {
  if (!range) return { from: null, to: null };

  const now = new Date();
  let from = new Date(now);
  let to = new Date(now);

  switch (range) {
    case "day":
      from.setDate(now.getDate() - 1);
      break;
    case "week":
      from.setDate(now.getDate() - 7);
      break;
    case "month":
      from.setMonth(now.getMonth() - 1);
      break;
    case "year":
      from.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return { from: null, to: null };
  }

  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);

  return { from, to };
}

function buildRangeFilter(range) {
  const { from } = getDateRange(range);
  if (!from) return null;

  const fromUnix = Math.floor(from.getTime() / 1000);
  return {
    where: "played_at >= ?",
    params: [fromUnix]
  };
}

function fillMissingDates(rows, range) {
    const { from, to } = getDateRange(range); 

    if (!from || !to) return rows; 

    const result = {};
    let current = new Date(from);
    
    while (current <= to) {
        const dayString = current.toISOString().substring(0, 10); 
        result[dayString] = { day: dayString, plays: 0 };
        
        current.setDate(current.getDate() + 1); 
    }
    
    rows.forEach(row => {
        result[row.day] = row;
    });

    return Object.values(result).sort((a, b) => (a.day > b.day ? 1 : -1));
}

module.exports = { buildRangeFilter, getDateRange, fillMissingDates };