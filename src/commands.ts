import { format } from 'util'
import { join, sep, normalize } from 'path'
import { readFile, readFileSync } from 'fs'
import * as mkdirp from 'mkdirp'
import * as internals from './internals'
import * as util from './util'
import { TinyBlob } from './tiny-blob'
import { TinyIndex } from './tiny-index'
import { TinyCommit } from './tiny-commit'

export type InitCallback = (err: Error) => void
export function init (done: InitCallback) {
  try {
    mkdirp.sync(join(util.repoDirpath(), 'objects'))
  } catch (err) {
    throw new Error('failed to initialize repository')
  }
}

export type HashObjectCallback = (err: Error, hash?: string) => void
export function hashObject (filename: string, write: boolean, done: HashObjectCallback): void {
  readFile(join(process.cwd(), filename), 'utf8', (err, contents) => {
    if (err != null) {
      return void done(new Error(err.code))
    } else {
      const blob = new TinyBlob(contents)
      if (write === true) {
        internals.writeObject(blob, (err, obj) => {
          if (err != null) {
            return void done(new Error(err.code))
          } else {
            return void done(null, obj.hash())
          }
        })
      } else {
        return void done(null, blob.hash())
      }
    }
  })
}

export function hashObjectSync (filename: string, write: boolean): string {
  let contents = ''
  try {
    contents = readFileSync(join(process.cwd(), filename), 'utf8')
  } catch (err) {
    throw new Error(format('failed to read `%s`', filename))
  }

  const blob = new TinyBlob(contents)

  if (write) {
    internals.writeObjectSync(blob)
  }

  return blob.hash()
}

export type CatFileCallback = (err: Error, stdout?: string) => void
export enum CatFileMode { Type, Size, Pretty, Exit }
export function catFile (hash: string, mode: CatFileMode, done: CatFileCallback) {
  internals.readObject(hash, (err, obj) => {
    if (err != null) {
      return void done(new Error(err.code))
    }

    switch (mode) {
      case CatFileMode.Type:
        return void done(null, obj.type())
      case CatFileMode.Size:
        return void done(null, obj.size().toString())
      case CatFileMode.Pretty:
        return void done(null, obj.pretty())
      case CatFileMode.Exit:
        return void done(null)
      default:
        return void done(new Error('unknown mode'))
    }
  })
}

export function catFileSync (hash: string, mode: CatFileMode): string {
  let obj = internals.readObjectSync(hash)

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

export type LsFilesCallback = (err: Error, output?: string) => void
export function lsFiles (done: LsFilesCallback) {
  internals.readIndex((err, index) => {
    if (err != null) {
      return void done(new Error(err.code))
    } else {
      return void done(null, index.pretty())
    }
  })
}

export function lsFilesSync (): string {
  return internals.readIndexSync().pretty()
}

export type UpdateIndexCallback = (err: Error) => void
export enum UpdateIndexMode { Add, Remove }
export function updateIndex (hash: string, name: string, mode: UpdateIndexMode, done: UpdateIndexCallback) {
  internals.readIndex((err, index) => {
    if (err != null) {
      return void done(new Error(err.code))
    }

    name = normalize(name)
    index.remove(name)

    if (mode === UpdateIndexMode.Add) {
      index.add(name, hash)
    }

    internals.writeIndex(index, (err) => {
      if (err != null) {
        return void done(new Error(err.code))
      } else {
        return void done(null)
      }
    })
  })
}

export function updateIndexSync (hash: string, name: string, mode: UpdateIndexMode): void {
  const index = internals.readIndexSync()
  name = normalize(name)

  index.remove(name)

  if (mode === UpdateIndexMode.Add) {
    index.add(name, hash)
  }

  internals.writeIndexSync(index)
}

export type WriteTreeCallback = (err: Error, hash?: string) => void
export function writeTree (prefix: string, missingOk: boolean, done: WriteTreeCallback): void {
  internals.readIndex((err, index) => {
    if (err) {
      return void done(new Error(err.code))
    }

    prefix = normalize(prefix)

    if (prefix !== '.') {
      prefix = prefix.split(sep).filter(s => s.length > 1).join(sep)
    }

    try {
      return void done(null, index.writeTree(prefix, missingOk))
    } catch (err) {
      return void done(err.code)
    }
  })
}

export function writeTreeSync (prefix: string, missingOk: boolean): string {
  const index = internals.readIndexSync()
  prefix = normalize(prefix)

  if (prefix !== '.') {
    prefix = prefix.split(sep).filter(s => s.length > 1).join(sep)
  }

  return index.writeTree(prefix, missingOk)
}

export function commitTreeSync (tree: string, parents: string[], author: string, message: string): string {
  const commit = new TinyCommit(tree, parents, author, message)
  internals.writeObjectSync(commit)
  return commit.hash()
}
