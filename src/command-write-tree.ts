import { normalize, sep } from 'path'
import { readIndexSync } from './io'
import { ObjectID } from './object-id'

export function writeTree (prefix: string, missingOk: boolean): ObjectID {
  const index = readIndexSync()
  prefix = normalize(prefix)

  if (prefix !== '.') {
    prefix = prefix.split(sep).filter(s => s.length > 1).join(sep)
  }

  return index.writeTree(prefix, missingOk)
}
