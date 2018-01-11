import * as mkdirp from 'mkdirp'
import * as fs from 'fs'
import * as path from 'path'
import * as plumbing from './plumbing'
import * as io from './io'
import * as resolve from './resolve'
import * as diffs from './diff'
import { ID } from './models/object'
import { Commit } from './models/commit'
import { Blob } from './models/blob'
import { Ref } from './models/ref'

export const init = (): void => {
  mkdirp.sync('.tinygit/objects')
  mkdirp.sync('.tinygit/refs')
  io.writeRef(new Ref('refs/HEAD', ID.NULL))
  io.readIndex()
}

export const add = (filepath: string): void => {
  const index = io.readIndex()
  if (fs.existsSync(filepath)) {
    const blob = plumbing.hashObject(filepath, true)
    plumbing.addToIndex(blob, filepath)
  } else if (index.hasObject(filepath)) {
    plumbing.removeFromIndex(filepath)
  }
}

export const reset = (filepath: string): void => {
  filepath = path.normalize(filepath)
  const ref   = io.readRef('refs/HEAD').pointer()
  const head  = ref.equals(ID.NULL) ? [] : resolve.treeishToFiles(ref)
  const index = io.readIndex()
  const found = head.reduce((found, blob) => {
    if (blob.name === filepath) {
      return blob.blob
    } else {
      return found
    }
  }, ID.NULL)

  if (found.equals(ID.NULL)) {
    index.removeObject(filepath)
  } else {
    index.replaceObject(filepath, found)
  }

  io.writeIndex(index)
}

export const commit = (author: string, message: string): void => {
  const tree = plumbing.writeTree('.')
  const parent = io.readRef('refs/HEAD').pointer()
  const parents = parent.equals(ID.NULL) ? [] : [parent]
  const commit = new Commit(tree, parents, author, message)
  io.writeObject(commit)
  io.writeRef(new Ref('refs/HEAD', commit.id()))
}

export const status = (): string => {
  const ref      = io.readRef('refs/HEAD').pointer()
  const head     = ref.equals(ID.NULL) ? [] : resolve.treeishToFiles(ref)
  const index    = resolve.indexToFiles()
  const staged   = resolve.fileDiffs(head, index)
  const unstaged = resolve.unstagedToFiles()
  const names    = staged.concat(unstaged).reduce((names, diff) => {
    if (names.indexOf(diff.name) === -1) {
      names.push(diff.name)
    }

    return names
  }, [] as string[]).sort()

  return names.map(name => {
    let s = ' ' as ' ' | 'A' | 'D' | 'M' | '?'
    let u = ' ' as ' ' | 'A' | 'D' | 'M' | '?'

    staged.some(diff => {
      if (diff.name === name) {
        s = diff.status[0].toUpperCase() as 'A' | 'D' | 'M'
        return true
      } else {
        return false
      }
    })

    unstaged.some(diff => {
      if (diff.name === name) {
        u = diff.status[0].toUpperCase() as 'A' | 'D' | 'M'
        return true
      } else {
        return false
      }
    })

    return `${s}${u} ${name}`
  }).join('\n')
}

export const log = (): Commit[] => {
  const log = [] as Commit[]
  let head = io.readRef('refs/HEAD').pointer()
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

export const branch = (name: string): void => {
  const refname = 'refs/branch/' + name
  const refpointer = io.readRef('refs/HEAD').pointer()
  io.writeRef(new Ref(refname, refpointer))
}
