import { readIndexSync, readLastCommit, writeIndexSync } from './io'
import { ObjectID } from './object-id'
import { TinyCommit } from './tiny-commit'

export function reset (path: string): void {
  const index = readIndexSync()
  const lastCommit = readLastCommit()

  if (lastCommit !== null) {
    const lastCommittedId = lastCommit.lookupPath(path)

    if (lastCommittedId !== null) {
      index.add(path, lastCommittedId)
    } else {
      index.remove(path)
    }
  } else {
    index.remove(path)
  }

  writeIndexSync(index)
}
