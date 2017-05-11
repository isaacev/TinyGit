import { format } from 'util'
import { parse } from 'path'
import { computeChildrenOfPrefix } from './util'
import * as internals from './internals'
import { TinyTree, TinyTreeRecord } from './tiny-tree'

export class TinyIndex {
  private _records: TinyTreeRecord[]

  constructor (records: TinyTreeRecord[]) {
    this._records = records
  }

  remove (name: string): void {
    this._records = this._records.filter((record) => record.name() !== name)
  }

  add (name: string, hash: string): void {
    this._records.push(new TinyTreeRecord(name, hash))
  }

  writeTree (prefix: string, missingOk: boolean): string {
    let children = computeChildrenOfPrefix(prefix, this._records)
    let records = [] as TinyTreeRecord[]

    children.dirs.forEach((dir) => {
      let name = parse(dir).base
      let hash = this.writeTree(dir, missingOk)
      records.push(new TinyTreeRecord(name, hash))
    })

    children.files.forEach((record) => {
      let name = parse(record.name()).base
      let hash = record.hash()
      records.push(new TinyTreeRecord(name, hash))
    })

    let tree = new TinyTree(records)
    internals.writeObjectSync(tree)
    return tree.hash()
  }

  encode (): string {
    let totalFiles = this._records.length
    let encodedRecords = this._records.map(r => r.encode()).join('')
    return format('index %d\0%s', totalFiles, encodedRecords)
  }

  pretty (): string {
    return this._records.map((record) => {
      return format('%s %s', record.hash(), record.name())
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
