type PublishableRecord = {
  isPublished?: unknown;
  status?: unknown;
};

// CMS records (moods, faqs, banners, ...) have no isPublished field; their status is the publish flag.
export function isPublishedOnHome(record: PublishableRecord | null | undefined): boolean {
  if (!record) return false;
  if (typeof record.isPublished === 'boolean') return record.isPublished;
  return record.status === 'active';
}

export function onlyPublished<T>(records: T[]): T[] {
  return records.filter((record) => isPublishedOnHome(record as PublishableRecord));
}
