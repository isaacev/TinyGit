import { format } from 'util'
import { writeFile, writeFileSync, readFile, readFileSync } from 'fs'
import { sync as mkdirpSync } from 'mkdirp'
import { TinyIndex } from './tiny-index'
import { TinyObject } from './tiny-object'
import { TinyBlob } from './tiny-blob'
import { TinyCommit } from './tiny-commit'
import * as util from './util'
import { ObjectID } from './object-id'

export function writeObjectSync (obj: TinyObject): TinyObject {
  const id       = obj.id()
  const dirpath  = util.objectsDirpath(id.prefix())
  const filepath = util.objectsFilepath(id.prefix(), id.suffix())

  try {
    mkdirpSync(dirpath)
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
  const filepath = util.indexFilepath()

  try {
    writeFileSync(filepath, index.encode())
  } catch (err) {
    throw new Error('failed to write index')
  }

  return index
}

export function readIndexSync (): TinyIndex {
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

export function writeBranchSync (branchName: string, id: ObjectID = ObjectID.NULL): void {
  const dirpath  = util.branchDirpath()
  const filepath = util.branchFilepath(branchName)

  try {
    mkdirpSync(dirpath)
  } catch (err) {
    throw new Error(format('failed to create `%s`', dirpath))
  }

  try {
    writeFileSync(filepath, id.toString() + '\n')
  } catch (err) {
    throw new Error(format('failed to write `%s`', filepath))
  }
}

export function readBranchSync (branchName: string): ObjectID {
  const filepath = util.branchFilepath(branchName)

  try {
    return new ObjectID(readFileSync(filepath, 'utf8'))
  } catch (err) {
    throw new Error(format('failed to read branch `%s`', branchName))
  }
}

export function writeHeadSync (branchName: string): void {
  const filepath = util.headFilepath()

  try {
    writeFileSync(filepath, branchName)
  } catch (err) {
    throw new Error(format('failed to write HEAD `%s`', filepath))
  }
}

export function readHeadSync (): string {
  const filepath = util.headFilepath()

  try {
    return readFileSync(filepath, 'utf8')
  } catch (err) {
    throw new Error(format('failed to read HEAD `%s`', filepath))
  }
}
