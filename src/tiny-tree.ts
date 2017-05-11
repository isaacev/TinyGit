import { format } from 'util'

export class TinyTreeRecord {
  private _mode: number
  private _name: string
  private _hash: string

  constructor (mode: number, name: string, hash: string) {
    this._mode = mode
    this._name = name
    this._hash = hash
  }

  mode (): number {
    return this._mode
  }

  name (): string {
    return this._name
  }

  hash (): string {
    return this._hash
  }

  encode (): string {
    return format('%d %s\0%s', this.mode(), this.name(), this.hash())
  }

  static decode (encoded: string): TinyTreeRecord[] {
    let pattern = /^(\d+) ([^\0]*)\0([0-9a-f]{40})/i
    let records: TinyTreeRecord[] = []

    let remaining = encoded
    while (true) {
      let parsed = remaining.match(pattern)

      if (parsed === null) {
        throw new Error('cannot decode string as a tree record')
      }

      remaining = remaining.substring(parsed[0].length)
      let mode = parseInt(parsed[1], 10)
      let name = parsed[2]
      let hash = parsed[3]
      records.push(new TinyTreeRecord(mode, name, hash))

      if (remaining.length === 0) {
        break
      }
    }

    return records
  }
}
