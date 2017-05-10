import { join } from 'path'
import { existsSync, writeFile } from 'fs'
import { format } from 'util'
import sha1 = require('sha1')
import * as mkdirp from 'mkdirp'

type EmptyCallback = (err: NodeJS.ErrnoException) => void

export function hashString (str: string): string {
  return String(sha1(str))
}

export function hashBlob (data: string): string {
  return hashString(format('blob %d\0%s', data.length, data))
}

export function writeObject (hash: string, data: string, done: EmptyCallback): void {
  exitIfRepoDoesNotExist()

  const prefix = hash.substring(0, 2)
  const suffix = hash.substring(2)

  mkdirp(objectsDirpath(prefix), (err) => {
    if (err != null) {
      return void done(err)
    }

    writeFile(objectsFilepath(prefix, suffix), data, (err) => {
      if (err != null) {
        return void done(err)
      } else {
        return void done(null)
      }
    })
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
