import { format as fmt } from 'util'
import * as path from 'path'
import * as fs from 'fs'

import * as io from './io'
import * as resolve from './resolve'
import { ID } from './models/object'
import { Commit } from './models/commit'
import { Tree, TreeChild } from './models/tree'
import { Blob } from './models/blob'
import { Ref } from './models/ref'

export const hashObject = (filepath: string, write: boolean = false): ID => {
  if (path.isAbsolute(filepath) === false) {
    filepath = path.resolve(filepath)
  }

  let data = ''
  try {
    data = fs.readFileSync(filepath, 'utf8')
  } catch (err) {
    throw new Error(fmt('failed to read %s', filepath))
  }

  const blob = new Blob(data)
  if (write) {
    io.writeObject(blob)
  }

  return blob.id()
}

export const catFile = (prefix: string): string => {
  const objects = io.listObjects()
  const matches = objects.filter(id => {
    return (id.whole().substring(0, prefix.length) === prefix)
  })

  if (matches.length > 1) {
    throw new Error(fmt('ambiguous reference %s', prefix))
  } else if (matches.length === 0) {
    throw new Error(fmt('no objects matching %s', prefix))
  }

  const match = matches[0]
  const object = io.readObject(match)
  return object.toString()
}

export const lsFiles = (): string => {
  const index = io.readIndex()
  const files = index.getObjects()
  return files.map(f => fmt('%s %s', f.id.whole(), f.name)).join('\n')
}

export const addToIndex = (id: ID, name: string): void => {
  const index = io.readIndex()
  const filepath = path.normalize(name)

  if (index.hasObject(filepath)) {
    index.replaceObject(filepath, id)
  } else {
    index.addObject(filepath, id)
  }

  io.writeIndex(index)
}

export const removeFromIndex = (name: string): void => {
  const index = io.readIndex()

  if (index.hasObject(name)) {
    index.removeObject(name)
    io.writeIndex(index)
  }
}

export const writeTree = (prefix: string): ID => {
  const normal = path.normalize(prefix)
  const index = io.readIndex()
  const files = index.getObjects()
  const knownDirs = []
  const children = files.reduce((children, f) => {
    const relative = path.relative(normal, f.name)
    const dirname = path.dirname(relative)
    if (dirname === '.') {
      return children.concat({
        name: relative,
        mode: 'blob',
        id:   f.id,
      })
    } else {
      const childDir = dirname.split(path.sep)[0]
      if (childDir !== '..' && knownDirs.indexOf(childDir) === -1) {
        knownDirs.push(childDir)
        return children.concat({
          name: childDir,
          mode: 'tree',
          id:   writeTree(path.join(normal, childDir)),
        })
      } else {
        return children
      }
    }
  }, [] as TreeChild[])

  return io.writeObject(new Tree(children))
}

export const commitTree = (tree: ID, parents: ID[], author: string, message: string): ID => {
  const commit = new Commit(tree, parents, author, message)
  io.writeObject(commit)
  return commit.id()
}

export const updateRef = (name: string, pointer: ID): void => {
  io.writeRef(new Ref(name, pointer))
}

export const showRef = (): Ref[] => {
  return io.listRefs()
}

export const diffIndex = (treeish: ID): resolve.FileDiff[] => {
  const indexFiles = resolve.indexToFiles()
  const treeFiles = resolve.treeishToFiles(treeish)
  return resolve.fileDiffs(treeFiles, indexFiles)
}
