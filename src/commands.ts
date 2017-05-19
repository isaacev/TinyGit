import { format } from 'util'
import { join, sep, normalize, parse, resolve, relative } from 'path'
import { mkdirSync, readFile, readFileSync, existsSync, readdirSync, statSync } from 'fs'
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

export function statusSync (): string {
  const index = io.readIndexSync()

  let untracked = [] as string[]
  let modified  = [] as string[]
  let removed   = [] as string[]

  index
    .map((record) => parse(record.name()).dir)                                  // isolate directories holding tracked files
    .map((dir) => normalize(dir))                                               // normalize those directory paths
    .reduce((accum, dir) => accum.concat(util.dirParents(dir)), [] as string[]) // create list of all ancestor directory paths
    .filter((dir, i, self) => i === self.indexOf(dir))                          // remove duplicates from the list of paths
    .map(dir => resolve(dir))                                                   // convert relative paths to absolute paths
    .forEach((trackedDir, i, self) => {
      readdirSync(trackedDir)                                                   // get list of names of directory contents
        .map(child => resolve(trackedDir, child))                               // convert relative paths to absolute paths
        .filter(child => self.indexOf(child) === -1)                            // remove paths to tracked directories
        .forEach((child) => {
          const stat = statSync(child)

          if (stat.isDirectory()) {
            untracked.push(child)
          } else if (stat.isFile()) {
            if (index.isTracked(child)) {
              const relativePath = relative(process.cwd(), child)
              if (index.getRecord(child).id().equals(hashObjectSync(relativePath, false)) === false) {
                modified.push(child)
              }
            } else {
              untracked.push(child)
            }
          }
        })
    })

  let stdout = ''
  stdout += modified.map((path) => format('M %s\n', path)).join('')
  stdout += removed.map((path) => format('D %s\n', path)).join('')
  stdout += untracked.map((path) => format('? %s\n', path)).join('')

  return stdout
}
