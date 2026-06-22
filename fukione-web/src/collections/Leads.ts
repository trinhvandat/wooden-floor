import type { CollectionConfig } from 'payload'

// The heart of the product: captured prospects + mini-CRM. Leads are written
// to the DB FIRST (source of truth); email notification is a later, best-effort
// step (wired in a future phase). `createdAt` is added by Payload automatically.
export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'source', 'status', 'createdAt'],
    group: 'CRM',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'email', type: 'email' },
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        { label: 'Calculator', value: 'calculator' },
        { label: 'Survey', value: 'survey' },
        { label: 'Quote', value: 'quote' },
        { label: 'Zalo', value: 'zalo' },
      ],
    },
    {
      name: 'productId',
      type: 'relationship',
      relationTo: 'products',
    },
    { name: 'area', type: 'number', min: 0 },
    { name: 'estimatedCost', type: 'number', min: 0 },
    { name: 'message', type: 'textarea' },
    { name: 'address', type: 'text' },
    { name: 'preferredTime', type: 'text' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Quoted', value: 'quoted' },
        { label: 'Won', value: 'won' },
        { label: 'Lost', value: 'lost' },
      ],
    },
  ],
}
