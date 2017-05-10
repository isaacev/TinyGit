import { format } from 'util'
import sha1 = require('sha1')

export function hashString (str: string): string {
  return String(sha1(str))
}

export function hashBlob (data: string): string {
  return hashString(format('blob %d\0%s', data.length, data))
}
