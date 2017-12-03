import { format as fmt } from 'util'
import * as path from 'path'
import * as fs from 'fs'

import * as io from './io'
import { ID } from './models/object'
import { Blob } from './models/blob'

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
  return object.contents()
}
