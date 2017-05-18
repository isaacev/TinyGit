import { format } from 'util'
import { parse, isAbsolute, relative } from 'path'
import { computeChildrenOfPrefix } from './util'
import * as io from './io'
import { TinyTree, TinyTreeRecord } from './tiny-tree'
import { ObjectID } from './object-id'

export class TinyIndex {
  private _records: TinyTreeRecord[]

  constructor (records: TinyTreeRecord[]) {
    this._records = records
  }

  remove (name: string): void {
    this._records = this._records.filter((record) => record.name() !== name)
  }

  add (name: string, id: ObjectID): void {
    this._records.push(new TinyTreeRecord(name, id))
  }

  getRecord (name: string): TinyTreeRecord {
    if (isAbsolute(name)) {
      name = relative(process.cwd(), name)
    }

    for (let i = 0; i < this._records.length; i++) {
      if (this._records[i].name() === name) {
        return this._records[i]
      }
    }

    return null
  }

  isTracked (name: string): boolean {
    if (isAbsolute(name)) {
      name = relative(process.cwd(), name)
    }

    return this._records.some((record) => (record.name() === name))
  }

  map<T> (iteratee: (record: TinyTreeRecord) => T): T[] {
    return this._records.map((record) => {
      return iteratee.apply(iteratee, [record])
    })
  }

  reduce<T> (iteratee: (accum: T, record: TinyTreeRecord) => T, memo: T): T {
    return this._records.reduce((accum, record) => {
      return iteratee.apply(iteratee, [accum, record])
    }, memo)
  }

  writeTree (prefix: string, missingOk: boolean): ObjectID {
    let children = computeChildrenOfPrefix(prefix, this._records)
    let records = [] as TinyTreeRecord[]

    children.dirs.forEach((dir) => {
      let name = parse(dir).base
      let id   = this.writeTree(dir, missingOk)
      records.push(new TinyTreeRecord(name, id))
    })

    children.files.forEach((record) => {
      let name = parse(record.name()).base
      let id = record.id()
      records.push(new TinyTreeRecord(name, id))
    })

    let tree = new TinyTree(records)
    io.writeObjectSync(tree)
    return tree.id()
  }

  encode (): string {
    let totalFiles = this._records.length
    let encodedRecords = this._records.map(r => r.encode()).join('')
    return format('index %d\0%s', totalFiles, encodedRecords)
  }

  pretty (): string {
    return this._records.map((record) => {
      return format('%s %s', record.id(), record.name())
    }).join('\n')
  }

  static decode (encoded: string): TinyIndex {
    let pattern = /^index (\d+)\0(.*)$/
    let parsed = encoded.match(pattern)

    if (parsed === null) {
      throw new Error('cannot parse encoded string')
    }

    let totalFiles = parseInt(parsed[1], 10)
    let records = TinyTreeRecord.decode(parsed[2])

    if (totalFiles !== records.length) {
      throw new Error('corrupted index file')
    }

    return new TinyIndex(records)
  }
}
