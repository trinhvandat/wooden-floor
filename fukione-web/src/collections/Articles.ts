import type { CollectionConfig } from 'payload'

// SEO blog posts that drive organic traffic and capture leads.
// `body` uses the config-level lexical editor.
export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'status'],
    group: 'Content',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'excerpt', type: 'textarea' },
    { name: 'body', type: 'richText' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'tags', type: 'text', hasMany: true },
    {
      name: 'seoMeta',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
    { name: 'publishedAt', type: 'date' },
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
