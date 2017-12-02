import 'mocha'
import { expect } from 'chai'

import { ID } from '../src/models/object'

describe('models', () => {
  describe('ID', () => {
    describe('constructor', () => {
      it('should reject badly formatted hashes', () => {
        expect(() => new ID(undefined)).to.throw(/cannot use/)
        expect(() => new ID('')).to.throw(/cannot use/)
        expect(() => new ID('0'.repeat(41))).to.throw(/cannot use/)
        expect(() => new ID('0'.repeat(39))).to.throw(/cannot use/)
        expect(() => new ID('g'.repeat(40))).to.throw(/cannot use/)
      })

      it('should accept correctly formatted hashes', () => {
        expect(() => new ID('0'.repeat(40))).to.not.throw()
        expect(() => new ID('a'.repeat(40))).to.not.throw()
        expect(() => new ID('A'.repeat(40))).to.not.throw()
        expect(() => new ID('f'.repeat(40))).to.not.throw()
        expect(() => new ID('F'.repeat(40))).to.not.throw()
      })
    })

    describe('#whole', () => {
      it('should return full 40 character SHA1 hash', () => {
        const id = new ID('0'.repeat(40))
        expect(id.whole()).to.equal('0'.repeat(40))
      })

      it('should output in lower-case', () => {
        const id = new ID('F'.repeat(40))
        expect(id.whole()).to.equal('f'.repeat(40))
      })
    })

    describe('#short', () => {
      it('should return first 4 character SHA1 hash', () => {
        const id = new ID('012af'.repeat(8))
        expect(id.short()).to.equal('012a')
      })

      it('should output in lower-case', () => {
        const id = new ID('012AF'.repeat(8))
        expect(id.short()).to.equal('012a')
      })
    })

    describe('#prefix', () => {
      it('should return first 2 characters of SHA1 hash', () => {
        const id = new ID('012af'.repeat(8))
        expect(id.prefix()).to.equal('01')
      })

      it('should output in lower-case', () => {
        const id = new ID('Af193'.repeat(8))
        expect(id.prefix()).to.equal('af')
      })
    })

    describe('#suffix', () => {
      it('should return last 38 characters of SHA1 hash', () => {
        const id = new ID('012af'.repeat(8))
        expect(id.suffix()).to.equal('2af' + '012af'.repeat(7))
      })

      it('should output in lower-case', () => {
        const id = new ID('Af193'.repeat(8))
        expect(id.suffix()).to.equal('193' + 'af193'.repeat(7))
      })
    })

    describe('#equals', () => {
      it('should return true on equivalent IDs', () => {
        const id1 = new ID('a'.repeat(40))
        const id2 = new ID('A'.repeat(40))
        expect(id1.equals(id2)).to.be.true
      })

      it('should return false on unequivalent IDs', () => {
        const id1 = new ID('a'.repeat(40))
        const id2 = new ID('b'.repeat(40))
        expect(id1.equals(id2)).to.be.false
      })
    })

    describe('#toString', () => {
      it('should be same as #whole()', () => {
        const id = new ID('a'.repeat(40))
        expect(id.toString()).to.equal(id.whole())
      })
    })
  })
})
