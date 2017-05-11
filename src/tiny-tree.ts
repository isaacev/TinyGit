import { format } from 'util'

export class TinyTreeRecord {
  private _name: string
  private _hash: string

  constructor (name: string, hash: string) {
    this._name = name
    this._hash = hash
  }

  name (): string {
    return this._name
  }

  hash (): string {
    return this._hash
  }

  encode (): string {
    return format('%s\0%s', this.name(), this.hash())
  }

  static decode (encoded: string): TinyTreeRecord[] {
    let pattern = /^([^\0]*)\0([0-9a-f]{40})/i
    let records: TinyTreeRecord[] = []

    let remaining = encoded
    while (true) {
      let parsed = remaining.match(pattern)

      if (parsed === null) {
        throw new Error('cannot decode string as a tree record')
      }

      remaining = remaining.substring(parsed[0].length)
      let name = parsed[1]
      let hash = parsed[2]
      records.push(new TinyTreeRecord(name, hash))

      if (remaining.length === 0) {
        break
      }
    }

    return records
  }
}
