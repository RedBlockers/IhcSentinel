export const formatBytes = (bytes) => {
  if (typeof bytes !== "number" || isNaN(bytes)) return "0 B/s";
  if (bytes === 0) return "0 B/s";
  const k = 1024;
  const sizes = ["B/s", "KB/s", "MB/s", "GB/s", "TB/s"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    new Intl.NumberFormat().format(
      parseFloat((bytes / Math.pow(k, i)).toFixed(2))
    ) +
    " " +
    sizes[i]
  );
};

export const formatData = (data, dataKey) => {
  return data.map((entry) => ({
    ...entry,
    [dataKey]: entry[dataKey],
    [`${dataKey}Formatted`]:
      dataKey === "network" ? formatBytes(entry[dataKey]) : entry[dataKey],
  }));
};

export const formatHours = (secs) => {
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  return `${hours}h ${minutes}m`;
};
