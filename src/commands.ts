import { join } from 'path'
import { mkdir } from 'fs'

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

export function hashObject () {
  // TODO
}
