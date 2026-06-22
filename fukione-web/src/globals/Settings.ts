import type { GlobalConfig } from 'payload'

// Global business config (singleton). Unit prices for the cost calculator and
// the site-wide NAP live here — read by app code, never hardcoded.
export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: {
    group: 'System',
  },
  fields: [
    { name: 'installPricePerM2', type: 'number', required: true, defaultValue: 80000 },
    { name: 'trimEstimate', type: 'number', required: true, defaultValue: 800000 },
    {
      name: 'nap',
      type: 'group',
      label: 'NAP (Name · Address · Phone)',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'address', type: 'text' },
        { name: 'phone', type: 'text' },
      ],
    },
    { name: 'showroomAddress', type: 'textarea' },
    { name: 'businessHours', type: 'text' },
    { name: 'mapEmbed', type: 'textarea' },
    { name: 'zaloOA', type: 'text' },
  ],
}
