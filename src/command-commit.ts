import { readBranchSync, readHeadSync, writeBranchSync } from './io'
import { writeTree } from './command-write-tree'
import { commitTree } from './command-commit-tree'
import { ObjectID } from './object-id'

export function commit (author: string, message: string): ObjectID {
  const treeId = writeTree('', false)
  const currentBranch = readHeadSync()
  const latestCommit = readBranchSync(currentBranch)
  const newCommit = commitTree(treeId, [latestCommit], author, message)

  writeBranchSync(currentBranch, newCommit)

  return newCommit
}
