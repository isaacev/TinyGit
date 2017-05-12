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

  static decode (encoded: string): TinyCommit {
    let pattern = /^commit \d+\0(.*)$/
    let parsed = encoded.match(pattern)

    if (parsed === null) {
      throw new Error('cannot parse encoded string')
    }

    let body = parsed[1]
    let lines = body.split('\n')
    let lineNum = 0

    let tree: string = null
    let parent: string = null
    let author: string = null
    let message: string = null

    // Required `tree` field
    if ((parsed = lines[lineNum++].match(/^tree ([0-9a-f]{40})$/i))) {
      tree = parsed[1]
    } else {
      throw new Error('corrupted commit object')
    }

    // Optional `parent` field
    if ((parsed = lines[lineNum].match(/^parent ([0-9a-f]{40})$/i))) {
      parent = parsed[1]
      lineNum++
    }

    // Required `author` field
    if ((parsed = lines[lineNum++].match(/^author (.*)$/i))) {
      author = parsed[1]
    } else {
      throw new Error('corrupted commit object')
    }

    // Required empty line between metadata and message
    if (lines.length <= lineNum || lines[lineNum++] !== '') {
      throw new Error('corrupted commit object')
    }

    // Required `message` field
    if (lines.length > lineNum) {
      message = lines[lineNum++]
    } else {
      throw new Error('corrupted commit object')
    }

    // Required empty line at the end of the commit message
    if (lines.length <= lineNum || lines[lineNum] !== '') {
      throw new Error('corrupted commit object')
    }

    return new TinyCommit(tree, parent, author, message)
  }
}
