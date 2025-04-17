// Format date to readable string
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Format time as mm:ss
export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export const getMinutesAgo = (isoTime: string | undefined) => {
  if (!isoTime) return "";

  const start = new Date(isoTime);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  return diffMin <= 0
    ? "just now"
    : `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
};
