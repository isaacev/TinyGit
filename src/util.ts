import { normalize, join, parse, sep } from 'path'
import { existsSync, readdirSync } from 'fs'
import sha1 = require('sha1')
import { TinyObject } from './tiny-object'
import { TinyBlob } from './tiny-blob'
import { TinyTree, TinyTreeRecord } from './tiny-tree'
import { TinyCommit } from './tiny-commit'
import { ObjectID } from './object-id'

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

export function mapStringToObjectID (arg: string): ObjectID {
  const prefix    = arg.substring(0, 2)
  const suffix    = arg.substring(2, 4)
  const dirpath   = objectsDirpath(prefix)
  const filenames = readdirSync(dirpath)

  for (let i = 0; i < filenames.length; i++) {
    const filename = filenames[i]

    if (filename.substring(0, 2) === suffix) {
      return new ObjectID(prefix + filename);
    }
  }

  throw new Error('invalid object ID')
}

export function repoDoesNotExist (): boolean {
  return (false === existsSync(repoDirpath()))
}

export function repoDirpath (): string {
  return join(process.cwd(), '.tinygit')
}

export function indexFilepath (): string {
  return join(repoDirpath(), 'index')
}

export function branchDirpath (): string {
  return join(repoDirpath(), 'refs')
}

export function branchFilepath (name: string): string {
  return join(branchDirpath(), name)
}

export function headFilepath (): string {
  return join(repoDirpath(), 'HEAD')
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

export function dirParents (fullPath: string): string[] {
  return normalize(fullPath).split(sep).reduce((accum, dir) => {
    return accum.concat(join(accum[accum.length - 1], dir))
  }, ['.'])
}
