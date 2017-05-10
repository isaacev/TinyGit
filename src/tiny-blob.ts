import { format } from 'util'
import { hashString } from './internals'
import { TinyObject } from './tiny-object'

export class TinyBlob implements TinyObject {
  private _contents: string

  constructor (contents: string) {
    this._contents = contents
  }

  type (): string {
    return 'blob'
  }

  size (): number {
    return this._contents.length
  }

  contents (): string {
    return this._contents
  }

  encode (): string {
    return format('blob %d\0%s', this.size(), this.contents())
  }

  hash (): string {
    return hashString(this.encode())
  }

  static decode (encoded: string): TinyBlob {
    let pattern = /^blob \d+\0(.*)$/
    let parsed = encoded.match(pattern)

    if (parsed === null) {
      throw new Error('cannot parse encoded string')
    } else {
      return new TinyBlob(parsed[1])
    }
  }
}
