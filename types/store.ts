export const validStoreTypes = ["GROCERY", "RESTAURANT", "PHARMACY", "ELECTRONICS", "CLOTHING", "BOOKS", "HARDWARE", "OTHER"];

export type StoreType = typeof validStoreTypes[number];