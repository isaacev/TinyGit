import * as plumbing from './plumbing'
import * as io from './io'
import * as resolve from './resolve'
import { ID } from './models/object'
import { Commit } from './models/commit'

export const add = (filepath: string): void => {
  const blob = plumbing.hashObject(filepath, true)
  plumbing.addToIndex(blob, filepath)
}

export const commit = (author: string, message: string): void => {
  const tree = plumbing.writeTree('.')
  const parent = io.readRef('HEAD')
  const parents = (parent === ID.NULL) ? [] : [parent]
  const commit = new Commit(tree, parents, author, message)
  io.writeObject(commit)
  io.writeRef('HEAD', commit.id())
}

export const status = (): resolve.FileDiff[] => {
  const head    = resolve.treeishToFiles(io.readRef('HEAD'))
  const index   = resolve.indexToFiles()
  const staged  = resolve.fileDiffs(head, index)
  return staged
}
