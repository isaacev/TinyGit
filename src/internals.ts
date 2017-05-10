import { join } from 'path'
import { existsSync } from 'fs'
import { format } from 'util'
import sha1 = require('sha1')

export function hashString (str: string): string {
  return String(sha1(str))
}

export function hashBlob (data: string): string {
  return hashString(format('blob %d\0%s', data.length, data))
}
export function exitIfRepoDoesNotExist (): boolean {
  if (false === existsSync(repoDirpath())) {
    console.error('Not a TinyGit repository')
    process.exit(1)
    return true
  }

  return false
}

export function repoDirpath (): string {
  return join(process.cwd(), '.tinygit')
}

