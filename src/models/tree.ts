import { format as fmt } from 'util'
import { ID, Object } from './object'

type TreeChild = { name: string, mode: 'blob' | 'tree', id: ID }

export class Tree implements Object {
  private _id       : ID
  private _children : TreeChild[]

  constructor (children: TreeChild[]) {
    this._children = children
    this._id       = ID.fromString(this.encode())
  }

  public id ()       : ID     { return this._id }
  public type ()     : 'tree' { return 'tree' }
  public size ()     : number { return this.contents().length }
  public encode ()   : string { return fmt('tree %d\0%s', this.size(), this.contents()) }
  public contents () : string {
    return this._children.map(c => fmt('%s\0%s\0%s', c.name, c.mode, c.id)).join('')
  }

  private static decodeChildren (raw: string): TreeChild[] {
    const pattern = /^([^\0]+)\0(blob|tree)\0([a-f0-9]{40})/i
    const children = [] as TreeChild[]
    let left = raw
    let parsed: RegExpMatchArray = null

    while ((parsed = left.match(pattern)) != null) {
      left = left.substring(parsed[0].length || 1)

      const mode = parsed[2] as ('blob' | 'tree')
      if (mode !== 'blob' && mode !== 'tree') {
        throw new Error('cannot decode as tree')
      }

      children.push({name: parsed[1], mode, id: new ID(parsed[3])})
    }

    if (left.length > 0) {
      throw new Error('cannot decode as tree')
    }

    return children
  }

  public static decode (raw: string): Tree {
    const pattern = /^tree \d+\0(.*)$/
    const parsed = raw.match(pattern)

    if (parsed === null) {
      throw new Error('cannot decode as tree')
    }

    const records = Tree.decodeChildren(parsed[1])
    return new Tree(records)
  }
}
