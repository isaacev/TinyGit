import { writeFile, writeFileSync, readFile } from 'fs'
import * as mkdirp from 'mkdirp'
import { TinyIndex } from './tiny-index'
import { TinyObject } from './tiny-object'
import { TinyBlob } from './tiny-blob'
import * as util from './util'

type IndexCallback  = (err: NodeJS.ErrnoException, index?: TinyIndex) => void
type ObjectCallback = (err: NodeJS.ErrnoException, obj?: TinyObject) => void

export function writeObject (obj: TinyObject, done: ObjectCallback): void {
  util.exitIfRepoDoesNotExist()

  const hash   = obj.hash()
  const prefix = hash.substring(0, 2)
  const suffix = hash.substring(2)

  mkdirp(util.objectsDirpath(prefix), (err) => {
    if (err != null) {
      return void done(err)
    }

    writeFile(util.objectsFilepath(prefix, suffix), obj.encode(), (err) => {
      if (err != null) {
        return void done(err)
      } else {
        return void done(null, obj)
      }
    })
  })
}

export function writeObjectSync (obj: TinyObject): TinyObject {
  util.exitIfRepoDoesNotExist()

  const hash   = obj.hash()
  const prefix = hash.substring(0, 2)
  const suffix = hash.substring(2)

  mkdirp.sync(util.objectsDirpath(prefix))
  writeFileSync(util.objectsFilepath(prefix, suffix), obj.encode())
  return obj
}

export function readObject (hash: string, done: ObjectCallback): void {
  util.exitIfRepoDoesNotExist()

  const prefix = hash.substring(0, 2)
  const suffix = hash.substring(2)

  readFile(util.objectsFilepath(prefix, suffix), 'utf8', (err, raw) => {
    if (err != null) {
      return void done(err)
    } else {
      return void done(null, util.decodeObject(raw))
    }
  })
}

export function writeIndex (index: TinyIndex, done: IndexCallback): void {
  util.exitIfRepoDoesNotExist()

  writeFile(util.indexFilepath(), index.encode(), (err) => {
    if (err != null) {
      return void done(err)
    } else {
      return void done(null, index)
    }
  })
}

export function readIndex (done: IndexCallback): void {
  util.exitIfRepoDoesNotExist()

  readFile(util.indexFilepath(), 'utf8', (err, raw) => {
    if (err != null) {
      if (err.code === 'ENOENT') {
        return void done(null, new TinyIndex([]))
      } else {
        return void done(err)
      }
    } else {
      return void done(null, TinyIndex.decode(raw))
    }
  })
}
