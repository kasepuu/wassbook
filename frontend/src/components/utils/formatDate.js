export function formatDateTime(inputDate) {
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };

  const parsedDate = new Date(inputDate);
  const formattedDate = parsedDate
    .toLocaleDateString("en-GB", options)
    .replace(/\//g, ".")
    .replace(",", " ");
  return formattedDate;
}
