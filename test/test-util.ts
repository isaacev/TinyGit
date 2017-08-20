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

describe('util#indexFilepath', () => {
  it('should return an absolute path to a local repo index file', () => {
    const val = util.indexFilepath()
    expect(val).to.equal(path.join(process.cwd(), '.tinygit/index'))
  })
})

describe('util#refsDirpath', () => {
  it('should return an absolute path to a local repo index file', () => {
    const val = util.refsDirpath()
    expect(val).to.equal(path.join(process.cwd(), '.tinygit/refs'))
  })
})

describe('util#onlyOneIsTrue', () => {
  it('should return false given no arguments', () => {
    expect(util.onlyOneIsTrue()).to.equal(false)
  })

  it('should return true when given only true', () => {
    expect(util.onlyOneIsTrue(true)).to.equal(true)
  })

  it('should return false when given only false', () => {
    expect(util.onlyOneIsTrue(false)).to.equal(false)
  })

  it('should return false when given only a string', () => {
    expect(util.onlyOneIsTrue('true')).to.equal(false)
  })

  it('should return false when given null', () => {
    expect(util.onlyOneIsTrue(null)).to.equal(false)
  })

  it('should return false when given undefined', () => {
    expect(util.onlyOneIsTrue(undefined)).to.equal(false)
  })

  it('should return false when given true and true', () => {
    expect(util.onlyOneIsTrue(true, true)).to.equal(false)
  })

  it('should return false when given false and false', () => {
    expect(util.onlyOneIsTrue(false, false)).to.equal(false)
  })

  it('should return true when given true and false', () => {
    expect(util.onlyOneIsTrue(true, false)).to.equal(true)
  })

  it('should return false when given many mixed values but no true', () => {
    expect(util.onlyOneIsTrue(false, 'true', 1, 0, undefined, null)).to.equal(false)
  })

  it('should return true when given many mixed values but only one true', () => {
    expect(util.onlyOneIsTrue(false, true, 1, 0, undefined, null)).to.equal(true)
  })
})
