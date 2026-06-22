import type { CollectionConfig } from 'payload'

// Shared image library (products, projects, articles, collections).
// Payload's `upload` adds url/filename/sizes; `sharp` handles resizing.
export const Media: CollectionConfig = {
  slug: 'media',
  upload: true,
  admin: {
    group: 'System',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
