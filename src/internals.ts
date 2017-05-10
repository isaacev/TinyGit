import { join } from 'path'
import { existsSync, writeFile, readFile } from 'fs'
import { format } from 'util'
import sha1 = require('sha1')
import * as mkdirp from 'mkdirp'
import { TinyObject } from './tiny-object'
import { TinyBlob } from './tiny-blob'

type ObjectCallback = (err: NodeJS.ErrnoException, obj?: TinyObject) => void

export function hashString (str: string): string {
  return String(sha1(str))
}

export function decodeObject (raw: string): TinyObject {
  if (raw.match(/^blob \d+\0/)) {
    return TinyBlob.decode(raw)
  } else {
    throw new Error('cannot decode object')
  }
}

export function writeObject (obj: TinyObject, done: ObjectCallback): void {
  exitIfRepoDoesNotExist()

  const hash   = obj.hash()
  const prefix = hash.substring(0, 2)
  const suffix = hash.substring(2)

  mkdirp(objectsDirpath(prefix), (err) => {
    if (err != null) {
      return void done(err)
    }

    writeFile(objectsFilepath(prefix, suffix), obj.encode(), (err) => {
      if (err != null) {
        return void done(err)
      } else {
        return void done(null, obj)
      }
    })
  })
}

export function readObject (hash: string, done: ObjectCallback): void {
  exitIfRepoDoesNotExist()

  const prefix = hash.substring(0, 2)
  const suffix = hash.substring(2)

  readFile(objectsFilepath(prefix, suffix), 'utf8', (err, raw) => {
    if (err != null) {
      return void done(err)
    } else {
      return void done(null, decodeObject(raw))
    }
  })
}

export function exitIfRepoDoesNotExist (): boolean {
  if (false === existsSync(repoDirpath())) {
    console.error('Not a TinyGit repository')
    process.exit(1)
    return true
  }

  return false
}

export function repoDirpath (): string {
  return join(process.cwd(), '.tinygit')
}

export function objectsDirpath (prefix: string): string {
  return join(repoDirpath(), 'objects', prefix)
}

export function objectsFilepath (prefix: string, suffix: string): string {
  return join(objectsDirpath(prefix), suffix)
}
