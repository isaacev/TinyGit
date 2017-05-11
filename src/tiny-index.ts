import { format } from 'util'
import { TinyTreeRecord } from './tiny-tree'

export class TinyIndex {
  private _records: TinyTreeRecord[]

  constructor (records: TinyTreeRecord[]) {
    this._records = records
  }

  remove (name: string): void {
    this._records = this._records.filter((record) => record.name() !== name)
  }

  add (mode: number, name: string, hash: string): void {
    this._records.push(new TinyTreeRecord(mode, name, hash))
  }

  encode (): string {
    let totalFiles = this._records.length
    let encodedRecords = this._records.map(r => r.encode()).join('')
    return format('index %d\0%s', totalFiles, encodedRecords)
  }

  pretty (): string {
    return this._records.map((record) => {
      return format('%d %s %s', record.mode(), record.hash(), record.name())
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
