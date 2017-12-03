import { format as fmt } from 'util'
import { ID, Object } from './object'

export class Blob implements Object {
  private _id   : ID
  private _data : string

  constructor (data: string) {
    this._data = data
    this._id   = ID.fromString(this.encode())
  }

  public id ()       : ID     { return this._id }
  public type ()     : 'blob' { return 'blob' }
  public size ()     : number { return this._data.length }
  public encode ()   : string { return fmt('blob %d\0%s', this.size(), this.contents()) }
  public contents () : string { return this._data }

  public static decode (raw: string): Blob {
    const pattern = /^blob \d+\0((.|[\r\n])*)$/
    const parsed = raw.match(pattern)

    if (parsed === null) {
      throw new Error('cannot decode as blob')
    }

    return new Blob(parsed[1])
  }
}
