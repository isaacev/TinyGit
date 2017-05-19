import * as io from './io'
import { ObjectID } from './object-id'
import { TinyBlob } from './tiny-blob'

export function hashObject (path: string, write: boolean = false): ObjectID {
  const contents = io.readFile(path)
  const blob = new TinyBlob(contents)

  if (write) {
    io.writeObjectSync(blob)
  }

  return blob.id()
}
