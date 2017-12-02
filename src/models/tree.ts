import { format as fmt } from 'util'
import { ID, Object } from './object'

type TreeChild = { name: string, id: ID }

export class Tree implements Object {
  private _id       : ID
  private _children : TreeChild[]

  constructor (id: ID, children: TreeChild[]) {
    this._id       = id
    this._children = children
  }

  public id ()       : ID     { return this._id }
  public type ()     : 'tree' { return 'tree' }
  public size ()     : number { return this.contents().length }
  public encode ()   : string { return fmt('blob %d\0%s', this.size(), this.contents()) }
  public contents () : string {
    return this._children.map(c => fmt('%s\0%s', c.name, c.id)).join('')
  }
}
