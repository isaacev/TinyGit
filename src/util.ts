import { join } from 'path'
import { existsSync } from 'fs'
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
