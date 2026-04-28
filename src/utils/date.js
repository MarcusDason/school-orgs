export const formatDate = (ts) => {
  if (!ts) return ""
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  })
}