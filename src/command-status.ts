import { format } from 'util'
import { join, normalize, parse, resolve } from 'path'
import { existsSync, readdirSync, statSync } from 'fs'
import { readIndexSync, readObjectSync, readBranchSync, readHeadSync } from './io'
import { dirParents } from './util'
import { ObjectID } from './object-id'
import { TinyIndex } from './tiny-index'
import { TinyCommit } from './tiny-commit'
import { hashObject } from './command-hash-object'

enum Status { Added, Modified, Deleted, Untracked, None }

export function status (): string {
  const index         = readIndexSync()
  const currentBranch = readHeadSync()
  const lastCommitId  = readBranchSync(currentBranch)
  const lastCommit    = (lastCommitId.equals(ObjectID.NULL) === false)
    ? readObjectSync(lastCommitId) as TinyCommit
    : null

  // files in index but not in commit
  const staged = index.reduce((accum, record) => {
    if (lastCommit === null) {
      accum.push([ Status.Added, record.name() ])
    } else {
      const committedId = lastCommit.lookupPath(record.name())

      if (committedId === null) {
        accum.push([ Status.Added, record.name() ])
      } else {
        const stagedId = record.id()

        if (stagedId.equals(committedId) === false) {
          accum.push([ Status.Modified, record.name() ])
        }
      }
    }

    return accum
  }, [] as [Status, string][])

  // tracked files with unstaged changes
  const changed = index.reduce((accum, record) => {
    const stagedId = index.getId(record.name())

    if (stagedId !== null) {
      if (existsSync(resolve(record.name()))) {
        const currentId = hashObject(resolve(record.name()))

        if (stagedId.equals(currentId) === false) {
          accum.push([ Status.Modified, record.name() ])
        }
      } else {
        accum.push([ Status.Deleted, record.name() ])
      }
    }

    return accum
  }, [] as [Status, string][])

  // siblings of tracked files that are not in the index
  const relDirPaths = getDirsWithTrackedDescendant(index)
  const untracked = relDirPaths.reduce((accum, relDirPath) => {
    const children = readdirSync(resolve(relDirPath))
      .map(child => join(relDirPath, child))
      .forEach((relChildPath) => {
        const stat = statSync(resolve(relChildPath))

        if (stat.isDirectory()) {
          if (relDirPaths.indexOf(relChildPath) === -1) {
            accum.push([ Status.Untracked, relChildPath + '/' ])
          }
        } else if (stat.isFile()) {
          if (index.isTracked(relChildPath) === false) {
            accum.push([ Status.Untracked, relChildPath ])
          }
        }
      })

    return accum
  }, [] as [Status, string][])

  let stdout = ''

  stdout += staged.reduce((accum, detection) => {
    const signal = formatStatusSignal(detection[0], Status.None)
    return accum + format('%s %s\n', signal, detection[1])
  }, '')

  stdout += changed.reduce((accum, detection) => {
    const signal = formatStatusSignal(Status.None, detection[0])
    return accum + format('%s %s\n', signal, detection[1])
  }, '')

  stdout += untracked.reduce((accum, detection) => {
    const signal = formatStatusSignal(Status.None, detection[0])
    return accum + format('%s %s\n', signal, detection[1])
  }, '')

  return stdout
}

function formatStatusSignal (staged: Status, unstaged: Status): string {
  const stagedSignal = formatSingleStatus(staged)
  const unstagedSignal = formatSingleStatus(unstaged)
  return stagedSignal + unstagedSignal
}

function formatSingleStatus (status: Status): string {
  switch (status) {
    case Status.Added:
      return 'A'
    case Status.Deleted:
      return 'D'
    case Status.Modified:
      return 'M'
    case Status.Untracked:
      return '?'
    default:
      return ' '
  }
}

function getDirsWithTrackedDescendant (index: TinyIndex): string[] {
  const dirsWithTrackedFiles = index
    .map((rec) => parse(rec.name()).dir)
    .map((path) => normalize(path))

  const parentsOfDirsWithTrackedFiles = dirsWithTrackedFiles
    .reduce((accum, path) => accum.concat(dirParents(path)), ['.'])
    .filter((path, i, self) => (i === self.indexOf(path)))

  return parentsOfDirsWithTrackedFiles
}
