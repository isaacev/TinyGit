import { join } from 'path'
import { readFile } from 'fs'
import * as mkdirp from 'mkdirp'
import * as internals from './internals'
import { TinyBlob } from './tiny-blob'

export function init () {
  mkdirp(join(internals.repoDirpath(), 'objects'), (err) => {
    if (err != null) {
      console.log(err.code)
      process.exit(err.errno || 1)
    }
  })
}

export function hashObject (filename, options) {
  readFile(join(process.cwd(), filename), 'utf8', (err, contents) => {
    if (err != null) {
      console.error('cannot read file %s', join(process.cwd(), filename))
      process.exit(err.errno || 1)
    } else {
      const blob = new TinyBlob(contents)
      if (options.write === true) {
        internals.writeObject(blob, (err, obj) => {
          console.log(obj.hash())
        })
      } else {
        console.log(blob.hash())
      }
    }
  })
}
