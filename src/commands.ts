import { join } from 'path'
import { readFile } from 'fs'
import * as mkdirp from 'mkdirp'
import * as internals from './internals'
import { TinyBlob } from './tiny-blob'
import { TinyIndex } from './tiny-index'

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

export function catFile (hash, options) {
  if (false === internals.onlyOneIsTrue(options.type, options.size, options.exit, options.print)) {
    options.help()
    process.exit(1)
    return
  }

  internals.readObject(hash, (err, obj) => {
    if (err != null) {
      console.error(err.code)
      process.exit(err.errno || 1)
      return
    }

    switch (true) {
      case options.type:
        console.log(obj.type())
        break
      case options.size:
        console.log(obj.size())
        break
      case options.print:
        console.log(obj.pretty())
        break
      case options.exit:
        process.exit(1)
        break
    }
  })
}

export function lsFiles () {
  internals.readIndex((err, index) => {
    if (err != null) {
      console.error(err.code)
      process.exit(err.errno || 1)
      return
    }

    console.log(index.pretty())
  })
}

export function updateIndex (options) {
  let pattern = /^([0-9a-f]{40}),(.+)$/i
  let parsed = (options.cacheinfo || '').match(pattern)

  if (parsed === null) {
    options.help()
    process.exit(1)
    return
  }

  let hash = parsed[1]
  let name = parsed[2]

  internals.readIndex((err, index) => {
    if (err != null) {
      console.error(err.code)
      process.exit(err.errno || 1)
      return
    }

    index.remove(name)

    if (options.add === true) {
      index.add(name, hash)
    }

    internals.writeIndex(index, (err) => {
      if (err != null) {
        console.error(err.code)
        process.exit(err.errno || 1)
      }
    })
  })
}
