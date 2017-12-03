import { format as fmt } from 'util'
import * as path from 'path'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'

import { ID, Object } from './models/object'
import { Commit } from './models/commit'
import { Tree } from './models/tree'
import { Blob } from './models/blob'

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

export const readObject = (id: ID): Object => {
  let raw = ''
  try {
    raw = fs.readFileSync(path.join(getRepoRoot(), 'objects', id.whole()), 'utf8')
  } catch (err) {
    throw new Error(fmt('failed to read object %s', id.toString()))
  }

  switch (true) {
    case /^commit \d+\0/.test(raw):
      return Commit.decode(raw)
    case /^tree \d+\0/.test(raw):
      return Tree.decode(raw)
    case /^blob \d+\0/.test(raw):
      return Blob.decode(raw)
    default:
      throw new Error(fmt('failed to decode %s', id.toString()))
  }
}

export const listObjects = (): ID[] => {
  return fs.readdirSync(path.join(getRepoRoot(), 'objects'))
    .filter(filename => ID.ish(filename))
    .map(filename => new ID(filename))
}
