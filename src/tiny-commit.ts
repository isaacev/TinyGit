import { format } from 'util'
import { hashString } from './util'
import { TinyObject } from './tiny-object'

export class TinyCommit implements TinyObject {
  private _tree: string
  private _author: string
  private _committer: string
  private _message: string

  constructor (tree: string, author: string, committer: string, message: string) {
    this._tree = tree
    this._author = author
    this._committer = committer
    this._message = message
  }

  public tree (): string {
    return this._tree
  }

  public author (): string {
    return this._author
  }

  public committer (): string {
    return this._committer
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
    return format('tree %s\nauthor %s\ncommitter %s\n\n%s\n', this.author(), this.committer(), this.message())
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
