import { format } from 'util'
import { join, sep, normalize, parse, resolve, relative } from 'path'
import { mkdirSync, readFile, readFileSync, existsSync, readdirSync, statSync } from 'fs'
import * as io from './io'
import * as util from './util'
import { TinyBlob } from './tiny-blob'
import { TinyIndex } from './tiny-index'
import { TinyCommit } from './tiny-commit'
import { ObjectID } from './object-id'
import { writeTree } from './command-write-tree'
import { commitTree } from './command-commit-tree'

export function commitSync (author: string, message: string): ObjectID {
  const treeId = writeTree('', false)
  const currentBranch = io.readHeadSync()
  const latestCommit = io.readBranchSync(currentBranch)
  const newCommit = commitTree(treeId, [latestCommit], author, message)

  io.writeBranchSync(currentBranch, newCommit)

  return newCommit
}
