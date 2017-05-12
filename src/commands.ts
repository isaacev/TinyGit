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

export enum CatFileMode { Type, Size, Pretty, Exit }
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

export function lsFilesSync (): string {
  return internals.readIndexSync().pretty()
}

export enum UpdateIndexMode { Add, Remove }
export function updateIndexSync (hash: string, name: string, mode: UpdateIndexMode): void {
  const index = internals.readIndexSync()
  name = normalize(name)

  index.remove(name)

  if (mode === UpdateIndexMode.Add) {
    index.add(name, hash)
  }

  internals.writeIndexSync(index)
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
