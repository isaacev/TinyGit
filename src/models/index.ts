import { format as fmt } from 'util'
import { ID, Object } from './object'

type IndexObject = { id: ID, name: string }

export class Index {
  private _objects : IndexObject[]

  constructor (objects: IndexObject[]) {
    this._objects = objects
    this.sortObjects()
  }

  private sortObjects (): void {
    this._objects.sort((a, b) => a.name > b.name ? 1 : -1)
  }

  public hasObject (name: string): boolean {
    for (const o of this._objects) {
      if (o.name === name) {
        return true
      }
    }

    return false
  }

  public addObject (name: string, id: ID): void {
    this._objects.push({ id, name })
    this.sortObjects()
  }

  public removeObject (name: string): void {
    this._objects = this._objects.filter(o => o.name !== name)
  }

  public replaceObject (name: string, id: ID): void {
    this.removeObject(name)
    this.addObject(name, id)
  }

  public getObjects () {
    return this._objects.slice()
  }

  public encode (): string {
    return this._objects.map(o => fmt('%s %s', o.id.whole(), o.name)).join('\n')
  }

  public static decode (raw: string): Index {
    const pattern = /^([0-9a-f]{40}) (.*)$/i
    const objects = raw.split('\n').filter(l => l != '').map(line => {
      const parsed = line.match(pattern)

      if (parsed == null) {
        throw new Error('cannot decode as index')
      }

      return { id: new ID(parsed[1]), name: parsed[2] }
    })

    return new Index(objects)
  }
}
