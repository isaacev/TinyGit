import { join } from 'path'
import { readFile } from 'fs'
import * as mkdirp from 'mkdirp'
import * as internals from './internals'

export function init () {
  mkdirp(join(internals.repoDirpath(), 'objects'), (err) => {
    if (err != null) {
      console.log(err.code)
      process.exit(err.errno || 1)
    }
  })
}

export function hashObject (filename) {
  readFile(join(process.cwd(), filename), 'utf8', (err, data) => {
    if (err != null) {
      console.error('cannot read file %s', join(process.cwd(), filename))
      process.exit(err.errno || 1)
    } else {
      console.log(internals.hashBlob(data))
    }
  })
}
