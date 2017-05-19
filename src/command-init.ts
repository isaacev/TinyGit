import { mkdirSync } from 'fs'
import { repoDirpath } from './util'
import { writeBranchSync, writeHeadSync } from './io'

export function init (): void {
  try {
    mkdirSync(repoDirpath())
  } catch (err) {
    throw new Error('failed to initialize repository')
  }

  writeBranchSync('master')
  writeHeadSync('master')
}
