import { readObjectSync } from './io'
import { ObjectID } from './object-id'

export enum CatFileMode { Type, Size, Pretty, Exit }

export function catFile (id: ObjectID, mode: CatFileMode): string {
  let obj = readObjectSync(id)

  switch (mode) {
    case CatFileMode.Type:
      return obj.type()
    case CatFileMode.Size:
      return obj.size().toString()
    case CatFileMode.Pretty:
      return obj.pretty()
    default:
      return ''
  }
}
