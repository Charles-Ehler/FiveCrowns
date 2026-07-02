const DAY_MS = 24 * 60 * 60 * 1000;

export function formatRelativeDate(timestamp) {
  if (!timestamp?.toDate) return '';
  const date = timestamp.toDate();
  const days = Math.floor((Date.now() - date.getTime()) / DAY_MS);

  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  const years = Math.floor(days / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}
