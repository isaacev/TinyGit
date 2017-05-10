import { join } from 'path'
import { mkdir, readFile } from 'fs'
import * as internals from './internals'

export function init () {
  mkdir(join(process.cwd(), '.tinygit'), (err) => {
    if (err != null) {
      if (err.code === 'EEXIST') {
        console.error('.tinygit directory already exists')
      } else if (err.code) {
        console.error(err.code)
      }

      process.exit(err.errno || 1);
    }
  })
}

export function hashObject (filename) {
  readFile(join(process.cwd(), filename), 'utf8', (err, data) => {
    if (err != null) {
      console.error('cannot read file %d', join(process.cwd(), filename))
      process.exit(err.errno || 1)
    } else {
      console.log(internals.hashBlob(data))
    }
  })
}
