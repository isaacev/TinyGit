import { format } from 'util'
import { existsSync, readdirSync } from 'fs'
import * as io from './io'
import { branchDirpath } from './util'
import { ObjectID } from './object-id'

export function showRef (): string {
  if (existsSync(branchDirpath()) === false) {
    return ''
  }

  return readdirSync(branchDirpath()).map((refname) => {
    const id = io.readBranchSync(refname)
    return format('%s %s', id, refname)
  }).join('\n')
}
