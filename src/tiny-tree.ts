import { format } from 'util'
import { hashString } from './util'
import { TinyObject } from './tiny-object'
import { ObjectID } from './object-id'

export class TinyTreeRecord {
  private _name : string
  private _id   : ObjectID

  constructor (name: string, id: ObjectID) {
    this._name = name
    this._id   = id
  }

  name (): string {
    return this._name
  }

  id (): ObjectID {
    return this._id
  }

  encode (): string {
    return format('%s\0%s', this.name(), this.id())
  }

  static decode (encoded: string): TinyTreeRecord[] {
    let pattern = /^([^\0]*)\0([0-9a-f]{40})/i
    let records: TinyTreeRecord[] = []

    let remaining = encoded
    while (true) {
      if (remaining.length === 0) {
        break
      }

      let parsed = remaining.match(pattern)

      if (parsed === null) {
        throw new Error('cannot decode string as a tree record')
      }

      remaining = remaining.substring(parsed[0].length)
      let name = parsed[1]
      let id   = new ObjectID(parsed[2])
      records.push(new TinyTreeRecord(name, id))
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

  id (): ObjectID {
    return new ObjectID(hashString(this.encode()))
  }

  pretty (): string {
    return this._records.map((record) => {
      return format('%s %s', record.id(), record.name())
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
