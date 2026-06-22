import type { CollectionConfig } from 'payload'

// Internal accounts for the admin panel. `email` + auth fields are added
// automatically by `auth: true`; `role` drives Phase-2 access control.
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'System',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'sale',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Sale', value: 'sale' },
      ],
    },
  ],
}
