import type { CollectionConfig } from 'payload'

// Wooden-floor SKU catalog (Phase 1: 52 products). Schema mirrors the
// frontend `Product` type in src/lib/types.ts; prices live here, never in code.
export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'pricePerM2', 'thicknessMm', 'waterproof', 'status'],
    group: 'Catalog',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'collectionRef',
      type: 'relationship',
      relationTo: 'collections',
    },
    {
      name: 'thicknessMm',
      type: 'select',
      required: true,
      options: [
        { label: '8 mm', value: '8' },
        { label: '12 mm', value: '12' },
      ],
    },
    { name: 'pricePerM2', type: 'number', required: true, min: 0 },
    { name: 'waterproof', type: 'checkbox', defaultValue: false },
    { name: 'color', type: 'text' },
    { name: 'surface', type: 'text' },
    { name: 'roomTypes', type: 'text', hasMany: true },
    { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
    {
      name: 'specs',
      type: 'array',
      fields: [
        { name: 'k', type: 'text', required: true },
        { name: 'v', type: 'text', required: true },
      ],
    },
    { name: 'description', type: 'textarea' },
    {
      name: 'seoMeta',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
  ],
}
