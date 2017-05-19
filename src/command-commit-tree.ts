import { writeObjectSync } from './io'
import { ObjectID } from './object-id'
import { TinyCommit } from './tiny-commit'

export function commitTree (id: ObjectID, parents: ObjectID[], author: string, message: string): ObjectID {
  const commit = new TinyCommit(id, parents, author, message)
  writeObjectSync(commit)
  return commit.id()
}
