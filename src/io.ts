import { format as fmt } from 'util'
import * as path from 'path'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'

import { ID, Object } from './models/object'
import { Index } from './models/index'
import { Commit } from './models/commit'
import { Tree } from './models/tree'
import { Blob } from './models/blob'
import { Ref } from './models/ref'

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

export const readIndex = (): Index => {
  const indexPath = path.join(getRepoRoot(), 'index')
  if (fs.existsSync(indexPath) === false) {
    const index = new Index([])
    writeIndex(index)
    return index
  } else {
    const raw = fs.readFileSync(indexPath, 'utf8')
    return Index.decode(raw)
  }
}

export const writeIndex = (index: Index): void => {
  fs.writeFileSync(path.join(getRepoRoot(), 'index'), index.encode(), 'utf8')
}

export const readRef = (name: string): Ref => {
  if (Ref.isLegalName(name) === false) {
    throw new Error('invalid reference name')
  }

  const ref = new Ref(name)
  if (fs.existsSync(ref.path())) {
    const pointer = new ID(fs.readFileSync(ref.path(), 'utf8'))
    ref.setPointer(pointer)
    return ref
  } else {
    return ref
  }
}

export const writeRef = (ref: Ref): void => {
  if (Ref.isLegalName(ref.name()) === false) {
    throw new Error('invalid reference name')
  }

  if (fs.existsSync(ref.path()) === false) {
    mkdirp.sync(path.dirname(ref.path()))
  }

  fs.writeFileSync(ref.path(), ref.pointer().whole(), 'utf8')
}

export const listRefs = (parent: string = 'refs'): Ref[] => {
  let refs = [] as Ref[]

  fs.readdirSync(path.join(getRepoRoot(), parent)).forEach(child => {
    const name = path.join(parent, child)
    const refpath = path.join(getRepoRoot(), name)
    const stat = fs.statSync(refpath)

    if (stat.isDirectory()) {
      listRefs(name).forEach(ref => refs.push(ref))
    } else {
      const pointer = new ID(fs.readFileSync(refpath, 'utf8'))
      refs.push(new Ref(name.replace(/\\/g, '/'), pointer))
    }
  })

  return refs
}
