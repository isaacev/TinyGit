import { ObjectID } from './object-id'

export interface TinyObject {
  type     (): string   // 'blob', 'tree', or 'commit'
  size     (): number   // size of contents in bytes
  contents (): string   // raw contents of object
  encode   (): string   // metadata prepended to raw contents
  id       (): ObjectID // SHA1 hash of encoded string
  pretty   (): string   // human-readable format of object data
}
