import 'mocha'
import { expect } from 'chai'
import * as path from 'path'

import * as util from '../src/util'

describe('util#hashString', () => {
  it('should return a SHA1 hash', () => {
    const val = util.hashString('hello')
    expect(val).to.equal('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d')
  })
})

describe('util#repoDirpath', () => {
  it('should return an absolute path to a local repository', () => {
    const val = util.repoDirpath()
    expect(val).to.equal(path.join(process.cwd(), '.tinygit'))
  })
})
