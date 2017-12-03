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
