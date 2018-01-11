import * as path from 'path'

import { getRepoRoot } from '../io'
import { ID } from './object'

export class Ref {
  private _name    : string
  private _pointer : ID

  constructor (name: string, pointer: ID = ID.NULL) {
    if (Ref.isLegalName(name) === false) {
      throw new Error('illegal reference name')
    }

    this._name = name
    this._pointer = pointer
  }

  public name(): string {
    return this._name
  }

  public pointer(): ID {
    return this._pointer
  }

  public setPointer(pointer: ID): void {
    this._pointer = pointer
  }

  public path(): string {
    return path.join(getRepoRoot(), this._name)
  }

  /**
   * A reference name can not:
   * 0. Be an empty string
   * 1. Have a path that begins with "."
   * 2. Have a double dot ".."
   * 3. Have an ASCII control character, "~", "^", ":", or SP, anywhere
   * 4. End with a "/"
   * 5. End with a ".lock"
   * 6. Contain a "\"
   *
   * A reference name must:
   * 7. Begin with "refs/"
   */
  public static isLegalName(name: string): boolean {
    // Handle case #0
    if (name.length <= 0) {
      return false
    }

    // Handle case #1
    if (/^\./.test(name)) {
      return false
    }

    // Handle cases #2, #3, #6
    if (/(\.\.|[\u0000-\u0020~^:]|\\)/.test(name)) {
      return false
    }

    // Handle case #4
    if (/\/$/.test(name)) {
      return false
    }

    // Handle case #5
    if (/\.lock$/.test(name)) {
      return false
    }

    // Handle case #6
    if (/^refs\//.test(name) === false) {
      return false
    }

    return true
  }
}
