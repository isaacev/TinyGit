import { format } from 'util'
import { existsSync, readdirSync } from 'fs'
import * as io from './io'
import { refsDirpath } from './util'
import { ObjectID } from './object-id'

export function showRef (): string {
  if (existsSync(refsDirpath()) === false) {
    return ''
  }

  return readdirSync(refsDirpath()).map((refname) => {
    const id = io.readBranchSync(refname)
    return format('%s %s', id, refname)
  }).join('\n')
}
