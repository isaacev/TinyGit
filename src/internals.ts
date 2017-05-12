import { format } from 'util'
import { writeFile, writeFileSync, readFile, readFileSync } from 'fs'
import * as mkdirp from 'mkdirp'
import { TinyIndex } from './tiny-index'
import { TinyObject } from './tiny-object'
import { TinyBlob } from './tiny-blob'
import * as util from './util'
import { ObjectID } from './object-id'

export function writeObjectSync (obj: TinyObject): TinyObject {
  util.exitIfRepoDoesNotExist()

  const id       = obj.id()
  const dirpath  = util.objectsDirpath(id.prefix())
  const filepath = util.objectsFilepath(id.prefix(), id.suffix())

  try {
    mkdirp.sync(dirpath)
  } catch (err) {
    throw new Error(format('failed to create `%s`', dirpath))
  }

  try {
    writeFileSync(filepath, obj.encode())
  } catch (err) {
    throw new Error(format('failed to write `%s`', dirpath))
  }

  return obj
}

export function readObjectSync (id: ObjectID): TinyObject {
  util.exitIfRepoDoesNotExist()

  const filepath = util.objectsFilepath(id.prefix(), id.suffix())

  let raw = ''
  try {
    raw = readFileSync(filepath, 'utf8')
  } catch (err) {
    throw new Error(format('failed to read `%s`', filepath))
  }

  try {
    return util.decodeObject(raw)
  } catch (err) {
    throw new Error(format('failed to decode `%s`', filepath))
  }
}

export function writeIndexSync (index: TinyIndex): TinyIndex {
  util.exitIfRepoDoesNotExist()

  const filepath = util.indexFilepath()

  try {
    writeFileSync(filepath, index.encode())
  } catch (err) {
    throw new Error('failed to write index')
  }

  return index
}

export function readIndexSync (): TinyIndex {
  util.exitIfRepoDoesNotExist()

  const filepath = util.indexFilepath()

  let raw = ''
  try {
    raw = readFileSync(filepath, 'utf8')
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      return new TinyIndex([])
    } else {
      throw new Error('failed to read index')
    }
  }

  try {
    return TinyIndex.decode(raw)
  } catch (err) {
    throw new Error('failed to decode index')
  }
}
