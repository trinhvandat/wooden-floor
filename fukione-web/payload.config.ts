import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Users } from './src/collections/Users'
import { Media } from './src/collections/Media'
import { Products } from './src/collections/Products'
import { Collections } from './src/collections/Collections'
import { Articles } from './src/collections/Articles'
import { Projects } from './src/collections/Projects'
import { Leads } from './src/collections/Leads'
import { Settings } from './src/globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  editor: lexicalEditor(),
  collections: [Users, Media, Products, Collections, Articles, Projects, Leads],
  globals: [Settings],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
