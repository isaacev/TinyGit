import { join, sep, normalize } from 'path'
import { readFile } from 'fs'
import * as mkdirp from 'mkdirp'
import * as internals from './internals'
import * as util from './util'
import { TinyBlob } from './tiny-blob'
import { TinyIndex } from './tiny-index'

export type InitCallback = (err: Error) => void
export function init (done: InitCallback) {
  mkdirp(join(util.repoDirpath(), 'objects'), (err) => {
    if (err != null) {
      return void done(new Error(err.code))
    } else {
      return void done(null)
    }
  })
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
