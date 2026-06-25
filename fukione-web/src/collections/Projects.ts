import type { CollectionConfig } from 'payload'

// Completed installations shown as social proof; can link the products used.
export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'location', 'areaM2'],
    group: 'Content',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'description', type: 'textarea' },
    { name: 'location', type: 'text' },
    { name: 'areaM2', type: 'number', min: 0 },
    { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
    {
      name: 'productRefs',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
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
