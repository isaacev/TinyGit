import { format } from 'util'
import { hashString } from './util'
import { TinyObject } from './tiny-object'

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

export class TinyTree implements TinyObject {
  private _records: TinyTreeRecord[]

  constructor (records: TinyTreeRecord[]) {
    this._records = records
  }

  type (): string {
    return 'tree'
  }

  size (): number {
    return this.contents().length
  }

  contents (): string {
    return this._records.map(child => child.encode()).join('')
  }

  encode (): string {
    return format('tree %d\0%s', this.size(), this.contents())
  }

  hash (): string {
    return hashString(this.encode())
  }

  pretty (): string {
    return this._records.map((record) => {
      return format('%s %s', record.hash(), record.name())
    }).join('\n')
  }

  static decode (encoded: string): TinyTree {
    let pattern = /^tree \d+\0(.*)$/
    let parsed = encoded.match(pattern)

    if (parsed === null) {
      throw new Error('cannot parse encoded string')
    }

    let records = TinyTreeRecord.decode(parsed[1])
    return new TinyTree(records)
  }
}
