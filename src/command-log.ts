import { format } from 'util'
import * as io from './io'
import { ObjectID } from './object-id'
import { TinyCommit } from './tiny-commit'

export function log (): string {
  let commitStream = [] as TinyCommit[]
  const currentBranch = io.readHeadSync()
  const latestCommitId = io.readBranchSync(currentBranch)
  let latestCommit = io.readObjectSync(latestCommitId) as TinyCommit

  while (latestCommit !== null) {
    commitStream.push(latestCommit)

    if (latestCommit.parents().length === 0) {
      latestCommit = null
    } else if (latestCommit.parents()[0].equals(ObjectID.NULL)) {
      latestCommit = null
    } else {
      latestCommit = io.readObjectSync(latestCommit.parents()[0]) as TinyCommit
    }
  }

  return commitStream.map((commit) => {
    return format('%s %s', commit.id().whole(), commit.message())
  }).join('\n')
}
