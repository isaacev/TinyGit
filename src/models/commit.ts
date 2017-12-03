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

  public id ()       : ID       { return this._id }
  public type ()     : 'commit' { return 'commit' }
  public size ()     : number   { return this.contents().length }
  public encode ()   : string   { return fmt('commit %d\0%s', this.size(), this.contents()) }
  public contents () : string   {
    const p = this._parents.map(p => fmt('parent %s\n', p)).join('')
    return fmt('tree %s\n%sauthor %s\n\n%s\n', this._tree, p, this._author, this._message)
  }
}
