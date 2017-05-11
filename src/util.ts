import { join } from 'path'
import { existsSync, readdir } from 'fs'
import sha1 = require('sha1')
import { TinyObject } from './tiny-object'
import { TinyBlob } from './tiny-blob'

export function decodeObject (raw: string): TinyObject {
  if (raw.match(/^blob \d+\0/)) {
    return TinyBlob.decode(raw)
  } else {
    throw new Error('cannot decode object')
  }
}

export function hashString (str: string): string {
  return String(sha1(str))
}

export function isShortHash (candidate: string): boolean {
  return /^[0-9a-f]{4}$/i.test(candidate)
}

export function isFullHash (candidate: string): boolean {
  return /^[0-9a-f]{40}$/i.test(candidate)
}

export function isLegalHash (candidate: string): boolean {
  return isFullHash(candidate) || isShortHash(candidate)
}

export function resolveHash (candidate: string, done: (err: Error, hash?: string) => void): void {
  if (isShortHash(candidate) || isFullHash(candidate)) {
    mapShortHashToFullHash(candidate, done)
  } else {
    done(new Error('Not a valid object ID'))
  }
}

export function mapShortHashToFullHash (candidate: string, done: (err: Error, hash?: string) => void): void {
  let prefix = candidate.substring(0, 2)
  let suffix = candidate.substring(2, 4)

  readdir(objectsDirpath(prefix), (err, filenames) => {
    if (err) {
      return void done(new Error(err.code))
    } else {
      let foundObject = filenames.some((filename) => {
        if (filename.substring(0, 2) === suffix) {
          done(null, prefix + filename)
          return true
        } else {
          return false
        }
      })

      if (foundObject === false) {
        return void done(new Error('Not a valid object ID'))
      }
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

export function indexFilepath (): string {
  return join(repoDirpath(), 'index')
}

export function objectsDirpath (prefix: string): string {
  return join(repoDirpath(), 'objects', prefix)
}

export function objectsFilepath (prefix: string, suffix: string): string {
  return join(objectsDirpath(prefix), suffix)
}

export function onlyOneIsTrue (...things: any[]): boolean {
  return 1 === things.reduce((accum, thing) => {
    if (thing === true) {
      return ++accum
    } else {
      return accum
    }
  }, 0)
}
