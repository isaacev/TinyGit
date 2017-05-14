import { format } from 'util'
import { join, sep, normalize } from 'path'
import { mkdirSync, readFile, readFileSync } from 'fs'
import * as io from './io'
import * as util from './util'
import { TinyBlob } from './tiny-blob'
import { TinyIndex } from './tiny-index'
import { TinyCommit } from './tiny-commit'
import { ObjectID } from './object-id'

export type InitCallback = (err: Error) => void
export function init (done: InitCallback) {
  try {
    mkdirSync(util.repoDirpath())
  } catch (err) {
    throw new Error('failed to initialize repository')
  }

  io.writeBranchSync('master')
  io.writeHeadSync('master')
}

export function hashObjectSync (filename: string, write: boolean): ObjectID {
  let contents = ''
  try {
    contents = readFileSync(join(process.cwd(), filename), 'utf8')
  } catch (err) {
    throw new Error(format('failed to read `%s`', filename))
  }

  const blob = new TinyBlob(contents)

  if (write) {
    io.writeObjectSync(blob)
  }

  return blob.id()
}

export enum CatFileMode { Type, Size, Pretty, Exit }
export function catFileSync (id: ObjectID, mode: CatFileMode): string {
  let obj = io.readObjectSync(id)

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
  return io.readIndexSync().pretty()
}

export enum UpdateIndexMode { Add, Remove }
export function updateIndexSync (id: ObjectID, name: string, mode: UpdateIndexMode): void {
  const index = io.readIndexSync()
  name = normalize(name)

  index.remove(name)

  if (mode === UpdateIndexMode.Add) {
    index.add(name, id)
  }

  io.writeIndexSync(index)
}

export function writeTreeSync (prefix: string, missingOk: boolean): ObjectID {
  const index = io.readIndexSync()
  prefix = normalize(prefix)

  if (prefix !== '.') {
    prefix = prefix.split(sep).filter(s => s.length > 1).join(sep)
  }

  return index.writeTree(prefix, missingOk)
}

export function commitTreeSync (id: ObjectID, parents: ObjectID[], author: string, message: string): ObjectID {
  const commit = new TinyCommit(id, parents, author, message)
  io.writeObjectSync(commit)
  return commit.id()
}

export function commitSync (author: string, message: string): ObjectID {
  const treeId = writeTreeSync('', false)
  const currentBranch = io.readHeadSync()
  const latestCommit = io.readBranchSync(currentBranch)
  const newCommit = commitTreeSync(treeId, [latestCommit], author, message)

  io.writeBranchSync(currentBranch, newCommit)

  return newCommit
}
