import { normalize } from 'path'
import { readIndexSync, writeIndexSync } from './io'
import { ObjectID } from './object-id'

export enum UpdateIndexMode { Add, Remove }

export function updateIndex (id: ObjectID, name: string, mode: UpdateIndexMode): void {
  const index = readIndexSync()
  name = normalize(name)

  index.remove(name)

  if (mode === UpdateIndexMode.Add) {
    index.add(name, id)
  }

  writeIndexSync(index)
}
