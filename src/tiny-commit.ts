import { format } from 'util'
import { hashString } from './util'
import { TinyObject } from './tiny-object'
import { ObjectID } from './object-id'

export class TinyCommit implements TinyObject {
  private _tree: ObjectID
  private _parents: ObjectID[]
  private _author: string
  private _message: string

  constructor (tree: ObjectID, parents: ObjectID[], author: string, message: string) {
    this._tree = tree
    this._parents = parents
    this._author = author
    this._message = message
  }

  public tree (): ObjectID {
    return this._tree
  }

  public parents (): ObjectID[] {
    return this._parents
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
    let content = ''
    content += format('tree %s\n', this.tree())
    content += this.parents().map(p => format('parent %s\n', p)).join('')
    content += format('author %s\n\n', this.author())
    content += format('%s\n', this.message())
    return content
  }

  public encode (): string {
    return format('commit %d\0%s', this.size(), this.contents())
  }

  public id (): ObjectID {
    return new ObjectID(hashString(this.encode()))
  }

  public pretty (): string {
    return this.contents()
  }

  static decode (encoded: string): TinyCommit {
    let pattern = /^(commit \d+\0)/
    let parsed = encoded.match(pattern)

    if (parsed === null) {
      throw new Error('cannot parse encoded string')
    }

    let tree: ObjectID = null
    let parents: ObjectID[] = []
    let author: string = null
    let message: string = null

    let body = encoded.substring(parsed[1].length)
    let lines = body.split('\n')
    let linesUsed = 0

    lines.some((line) => {
      linesUsed++

      if (line.substring(0, 5) === 'tree ') {
        tree = new ObjectID(line.substring(5))
      } else if (line.substring(0, 7) === 'parent ') {
        parents.push(new ObjectID(line.substring(7)))
      } else if (line.substring(0, 7) === 'author ') {
        author = line.substring(7)
      }

      return (line === '')
    })

    message = lines[linesUsed]

    return new TinyCommit(tree, parents, author, message)
  }
}
