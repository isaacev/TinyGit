import { format as fmt } from 'util'
import * as path from 'path'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'

import { ID, Object } from './models/object'

export const getRepoRoot = (): string => {
  return path.join(process.cwd(), '.tinygit')
}

export const writeObject = (obj: Object): ID => {
  const objPath = path.join(getRepoRoot(), 'objects')
  try {
    fs.writeFileSync(path.join(objPath, obj.id().whole()), obj.encode())
    return obj.id()
  } catch (err) {
    throw new Error(fmt('failed to write object %s', obj.id.toString()))
  }
}
