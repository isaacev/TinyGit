import { join, parse, sep } from 'path'
import { existsSync, readdir, readdirSync } from 'fs'
import sha1 = require('sha1')
import { TinyObject } from './tiny-object'
import { TinyBlob } from './tiny-blob'
import { TinyTree, TinyTreeRecord } from './tiny-tree'
import { TinyCommit } from './tiny-commit'

export function decodeObject (raw: string): TinyObject {
  if (raw.match(/^blob \d+\0/)) {
    return TinyBlob.decode(raw)
  } else if (raw.match(/^tree \d+\0/)) {
    return TinyTree.decode(raw)
  } else if (raw.match(/^commit \d+\0/)) {
    return TinyCommit.decode(raw)
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

export function mapShortHashToFullHashSync (candidate: string): string {
  const prefix    = candidate.substring(0, 2)
  const suffix    = candidate.substring(2, 4)
  const dirpath   = objectsDirpath(prefix)
  const filenames = readdirSync(dirpath)

  for (let i = 0; i < filenames.length; i++) {
    const filename = filenames[i]

    if (filename.substring(0, 2) === suffix) {
      return prefix + filename;
    }
  }

  throw new Error('invalid object ID')
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

export function computeChildrenOfPrefix (prefix: string, records: TinyTreeRecord[]): { files: TinyTreeRecord[], dirs: string[] } {
  return records.reduce((accum, record) => {
    let dir = parse(record.name()).dir
    let prefixDirs = prefix.split(sep)
    let dirs = dir.split(sep)

    if (prefix === '.') {
      if (dir === '') {
        accum.files.push(record)
      } else {
        if (accum.dirs.indexOf(dirs[0]) === -1) {
          accum.dirs.push(dirs[0])
        }
      }
    } else if (dir === prefix) {
      accum.files.push(record)
    } else {
      for (let i = 0; i < dirs.length; i++) {
        if (i < prefixDirs.length) {
          if (prefixDirs[i] !== dirs[i]) {
            break
          }
        } else if (i === prefixDirs.length) {
          let childDir = prefixDirs.concat(dirs[i]).join(sep)

          if (accum.dirs.indexOf(dirs[i]) === -1) {
            accum.dirs.push(childDir)
          }

          break
        }
      }
    }

    return accum
  }, { files: [] as TinyTreeRecord[], dirs: [] as string[] })
}
