import * as path from 'path'
import { ID } from './models/object'
import { Commit } from './models/commit'
import { Tree } from './models/tree'
import * as io from './io'

export type NamedBlob = {
  name : string
  blob : ID
}

export type FileDiff = {
  status : 'modified' | 'deleted' | 'added' | 'moved'
  name   : string
  before : ID
  after  : ID
}

export const indexToFiles = (): NamedBlob[] => {
  const index = io.readIndex()
  const files = index.getObjects()
  return files.map(file => {
    return {name: file.name, blob: file.id}
  })
}

export const treeishToFiles = (treeish: ID, prefix: string='.'): NamedBlob[] => {
  const tree = toTree(treeish)
  return tree.children().reduce((files, child) => {
    const name = path.join(prefix, child.name)
    if (child.mode === 'blob') {
      return files.concat({name, blob: child.id})
    } else if (child.mode === 'tree') {
      return files.concat(treeishToFiles(child.id, name))
    }
  }, [] as NamedBlob[])
}

export const toTree = (treeish: ID): Tree => {
  const obj = io.readObject(treeish)
  if (obj instanceof Commit) {
    return io.readObject((obj as Commit).tree()) as Tree
  } else if (obj instanceof Tree) {
    return obj as Tree
  } else {
    throw new Error('expected tree-like object')
  }
}

export const fileDiffs = (before: NamedBlob[], after: NamedBlob[]): FileDiff[] => {
  const names = before.concat(after).reduce((names, member) => {
    if (names.indexOf(member.name) === -1) {
      names.push(member.name)
    }

    return names
  }, [] as string[])

  const diffs = names.reduce((diffs, name) => {
    let beforeBlob = ID.NULL
    for (const member of before) {
      if (member.name === name) {
        beforeBlob = member.blob
        break
      }
    }

    let afterBlob = ID.NULL
    for (const member of after) {
      if (member.name === name) {
        afterBlob = member.blob
        break
      }
    }

    if (beforeBlob.equals(afterBlob) === false) {
      const pending = {
        status : null,
        name   : name,
        before : beforeBlob,
        after  : afterBlob,
      } as FileDiff

      if (beforeBlob.equals(ID.NULL)) {
        pending.status = 'added'
      } else if (afterBlob.equals(ID.NULL)) {
        pending.status = 'deleted'
      } else {
        pending.status = 'modified'
      }

      diffs.push(pending)
    }

    return diffs
  }, [] as FileDiff[])

  return diffs
}
