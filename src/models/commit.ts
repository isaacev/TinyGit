import { format as fmt } from 'util'
import { ID, Object } from './object'

export class Commit implements Object {
  private _id      : ID
  private _tree    : ID
  private _parents : ID[]
  private _author  : string
  private _message : string

  constructor (tree: ID, parents: ID[], author: string, message: string) {
    this._tree    = tree
    this._parents = parents
    this._author  = author
    this._message = message
    this._id      = ID.fromString(this.encode())
  }

  public tree () : ID { return this._tree }

  public id ()       : ID       { return this._id }
  public type ()     : 'commit' { return 'commit' }
  public size ()     : number   { return this.contents().length }
  public encode ()   : string   { return fmt('commit %d\0%s', this.size(), this.contents()) }
  public contents () : string   {
    const p = this._parents.map(p => fmt('parent %s\n', p)).join('')
    return fmt('tree %s\n%sauthor %s\n\n%s\n', this._tree, p, this._author, this._message)
  }
  public toString () : string {
    let out = ''
    out += fmt('tree %s\n', this._tree)
    out += this._parents.reduce((out, p) => out + fmt('parent %s\n', p), '')
    out += fmt('author %s\n', this._author)
    out += fmt('\n%s\n', this._message)
    return out
  }

  public static decode (raw: string): Commit {
    const pattern = /^commit \d+\0/
    const parsed = raw.match(pattern)

    if (parsed === null) {
      throw new Error('cannot decode as commit')
    }

    let treeID: ID = null
    let parentIDs: ID[] = []
    let author: string = null
    let message: string = null

    const body = raw.substring(parsed[0].length)
    const lines = body.split('\n')
    let linesUsed = 0
    lines.some(line => {
      linesUsed++

      if (line.substring(0, 5) === 'tree ') {
        treeID = new ID(line.substring(5))
      } else if (line.substring(0, 7) === 'parent ') {
        parentIDs.push(new ID(line.substring(7)))
      } else if (line.substring(0, 7) === 'author ') {
        author = line.substring(7)
      }

      return (line === '')
    })

    message = lines[linesUsed]
    return new Commit(treeID, parentIDs, author, message)
  }
}
