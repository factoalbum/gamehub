export function normalizeCatalogValue(value: string) {
  return value.trim().toLowerCase();
}

export function slugifyCatalogValue(value: string) {
  return normalizeCatalogValue(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
