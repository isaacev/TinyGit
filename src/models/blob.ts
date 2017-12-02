import { format as fmt } from 'util'
import { ID, Object } from './object'

export class Blob implements Object {
  private _id   : ID
  private _data : string

  constructor (id: ID, data: string) {
    this._id = id
    this._data = data
  }

  public id ()       : ID     { return this._id }
  public type ()     : 'blob' { return 'blob' }
  public size ()     : number { return this._data.length }
  public encode ()   : string { return fmt('blob %d\0%s', this.size(), this.contents()) }
  public contents () : string { return this._data }
}
