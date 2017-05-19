import { format } from 'util'
import { join, sep, normalize, parse, resolve, relative } from 'path'
import { mkdirSync, readFile, readFileSync, existsSync, readdirSync, statSync } from 'fs'
import * as io from './io'
import * as util from './util'
import { TinyBlob } from './tiny-blob'
import { TinyIndex } from './tiny-index'
import { TinyCommit } from './tiny-commit'
import { ObjectID } from './object-id'

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
