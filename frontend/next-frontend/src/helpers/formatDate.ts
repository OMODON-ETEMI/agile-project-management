
export function formatDate(dateVal: { $date: string } | string | undefined) {
  if (!dateVal) return "N/A";
  const raw = typeof dateVal === "object" ? dateVal.$date : dateVal;
  return new Date(raw).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}