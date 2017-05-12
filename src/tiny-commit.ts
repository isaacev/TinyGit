import { format } from 'util'
import { hashString } from './util'
import { TinyObject } from './tiny-object'

export class TinyCommit implements TinyObject {
  private _tree: string
  private _parent: string
  private _author: string
  private _message: string

  constructor (tree: string, parent: string, author: string, message: string) {
    this._tree = tree
    this._parent = parent
    this._author = author
    this._message = message
  }

  public tree (): string {
    return this._tree
  }

  public parent (): string {
    return this._parent
  }

  public author (): string {
    return this._author
  }

  public message (): string {
    return this._message
  }

  public type (): string {
    return 'commit'
  }

  public size (): number {
    return this.contents().length
  }

  public contents (): string {
    if (this._parent === null) {
      const fmt = 'tree %s\nauthor %s\n\n%s\n'
      return format(fmt, this.tree(), this.author(), this.message())
    } else {
      const fmt = 'tree %s\nparent %s\nauthor %s\n\n%s\n'
      return format(fmt, this.tree(), this.parent(), this.author(), this.message())
    }
  }

  public encode (): string {
    return format('commit %d\0%s', this.size(), this.contents())
  }

  public hash (): string {
    return hashString(this.encode())
  }

  public pretty (): string {
    return this.contents()
  }
}
