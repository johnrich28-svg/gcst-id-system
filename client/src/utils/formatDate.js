export const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTime = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
