import { format as fmt } from 'util'
const sha1 = require('sha1')

export class ID {
  private _whole  : string
  private _short  : string
  private _prefix : string
  private _suffix : string

  constructor (hash: string) {
    if (/^[0-9a-f]{40}$/i.test(hash) === false) {
      throw new Error(fmt('cannot use `%s` as object ID', hash))
    }

    this._whole  = hash.toLowerCase()
    this._short  = this._whole.substring(0, 4)
    this._prefix = this._whole.substring(0, 2)
    this._suffix = this._whole.substring(2)
  }

  public whole (): string {
    return this._whole
  }

  public short (): string {
    return this._short
  }

  public prefix (): string {
    return this._prefix
  }

  public suffix (): string {
    return this._suffix
  }

  public equals (other: ID): boolean {
    return (this.whole() === other.whole())
  }

  public toString (): string {
    return this.whole()
  }

  public static NULL = new ID('0000000000000000000000000000000000000000')

  public static fromString (data: string): ID {
    const digest: string = sha1(data).toString()
    return new ID(digest)
  }
}

export interface Object {
  type     (): 'blob' | 'tree' | 'commit'
  id       (): ID     // SHA1 digest of encoded string
  size     (): number // size of contents in bytes
  encode   (): string // metadata prepended to raw contents
  contents (): string // raw contents of object
}
