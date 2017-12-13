import * as mkdirp from 'mkdirp'
import * as plumbing from './plumbing'
import * as io from './io'
import * as resolve from './resolve'
import * as diffs from './diff'
import { ID } from './models/object'
import { Commit } from './models/commit'
import { Blob } from './models/blob'

export const init = (): void => {
  mkdirp.sync('.tinygit/objects')
  mkdirp.sync('.tinygit/refs')
  io.writeRef('HEAD', ID.NULL)
  io.readIndex()
}

export const add = (filepath: string): void => {
  const blob = plumbing.hashObject(filepath, true)
  plumbing.addToIndex(blob, filepath)
}

export const commit = (author: string, message: string): void => {
  const tree = plumbing.writeTree('.')
  const parent = io.readRef('HEAD')
  const parents = parent.equals(ID.NULL) ? [] : [parent]
  const commit = new Commit(tree, parents, author, message)
  io.writeObject(commit)
  io.writeRef('HEAD', commit.id())
}

export const status = (): resolve.FileDiff[] => {
  const ref     = io.readRef('HEAD')
  const head    = ref.equals(ID.NULL) ? [] : resolve.treeishToFiles(ref)
  const index   = resolve.indexToFiles()
  const staged  = resolve.fileDiffs(head, index)
  return staged
}

export const log = (): Commit[] => {
  const log = [] as Commit[]
  let head = io.readRef('HEAD')
  while (head != null) {
    const commit = io.readObject(head) as Commit
    log.push(commit)

    if (commit.parents().length === 0) {
      head = null
    } else {
      head = commit.parents()[0]

      if (head.equals(ID.NULL)) {
        head = null
      }
    }
  }
  return log
}

export const diff = (a: ID, b: ID): void => {
  const aFiles = resolve.treeishToFiles(a)
  const bFiles = resolve.treeishToFiles(b)
  const files = resolve.fileDiffs(aFiles, bFiles)

  files.forEach(d => {
    let before = null
    let after = null

    if (d.status === 'deleted' || d.status === 'modified') {
      before = (io.readObject(d.before) as Blob).contents()
    }

    if (d.status === 'added' || d.status === 'modified') {
      after = (io.readObject(d.after) as Blob).contents()
    }

    console.log()
    console.log(d.name)
    diffs.strings(before, after).forEach(d => {
      console.log(d.toString())
    })
  })
}
