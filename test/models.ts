import 'mocha'
import { expect } from 'chai'

import { ID } from '../src/models/object'
import { Blob } from '../src/models/blob'

describe('models', () => {
  function repeat (c: string, n: number) {
    let rep = ''
    while (0 < n--) {
      rep += c
    }
    return rep
  }

  describe('ID', () => {
    describe('constructor', () => {
      it('should reject badly formatted hashes', () => {
        expect(() => new ID(undefined)).to.throw(/cannot use/)
        expect(() => new ID('')).to.throw(/cannot use/)
        expect(() => new ID(repeat('0', 41))).to.throw(/cannot use/)
        expect(() => new ID(repeat('0', 39))).to.throw(/cannot use/)
        expect(() => new ID(repeat('g', 40))).to.throw(/cannot use/)
      })

      it('should accept correctly formatted hashes', () => {
        expect(() => new ID(repeat('0', 40))).to.not.throw()
        expect(() => new ID(repeat('a', 40))).to.not.throw()
        expect(() => new ID(repeat('A', 40))).to.not.throw()
        expect(() => new ID(repeat('f', 40))).to.not.throw()
        expect(() => new ID(repeat('F', 40))).to.not.throw()
      })
    })

    describe('#whole', () => {
      it('should return full 40 character SHA1 hash', () => {
        const id = new ID(repeat('0', 40))
        expect(id.whole()).to.equal(repeat('0', 40))
      })

      it('should output in lower-case', () => {
        const id = new ID(repeat('F', 40))
        expect(id.whole()).to.equal(repeat('f', 40))
      })
    })

    describe('#short', () => {
      it('should return first 4 character SHA1 hash', () => {
        const id = new ID(repeat('012af', 8))
        expect(id.short()).to.equal('012a')
      })

      it('should output in lower-case', () => {
        const id = new ID(repeat('012AF', 8))
        expect(id.short()).to.equal('012a')
      })
    })

    describe('#prefix', () => {
      it('should return first 2 characters of SHA1 hash', () => {
        const id = new ID(repeat('012af', 8))
        expect(id.prefix()).to.equal('01')
      })

      it('should output in lower-case', () => {
        const id = new ID(repeat('Af193', 8))
        expect(id.prefix()).to.equal('af')
      })
    })

    describe('#suffix', () => {
      it('should return last 38 characters of SHA1 hash', () => {
        const id = new ID(repeat('012af', 8))
        expect(id.suffix()).to.equal('2af' + repeat('012af', 7))
      })

      it('should output in lower-case', () => {
        const id = new ID(repeat('Af193', 8))
        expect(id.suffix()).to.equal('193' + repeat('af193', 7))
      })
    })

    describe('#equals', () => {
      it('should return true on equivalent IDs', () => {
        const id1 = new ID(repeat('a', 40))
        const id2 = new ID(repeat('A', 40))
        expect(id1.equals(id2)).to.be.true
      })

      it('should return false on unequivalent IDs', () => {
        const id1 = new ID(repeat('a', 40))
        const id2 = new ID(repeat('b', 40))
        expect(id1.equals(id2)).to.be.false
      })
    })

    describe('#toString', () => {
      it('should be same as #whole()', () => {
        const id = new ID(repeat('a', 40))
        expect(id.toString()).to.equal(id.whole())
      })
    })
  })

  describe('blob', () => {
    describe('#id', () => {
      it('should return the id', () => {
        const i = ID.NULL
        const b = new Blob(i, 'foobar')
        expect(b.id()).to.equal(i)
      })
    })

    describe('#type', () => {
      it('should return "blob"', () => {
        const i = ID.NULL
        const b = new Blob(i, 'foobar')
        expect(b.type()).to.equal('blob')
      })
    })

    describe('#size', () => {
      it('should return the number of characters in blob data', () => {
        const i = ID.NULL
        const b = new Blob(i, 'foobar')
        expect(b.size()).to.equal('foobar'.length)
      })
    })

    describe('#encode', () => {
      it('should return the fully encoded blob', () => {
        const i = ID.NULL
        const b = new Blob(i, 'foobar')
        expect(b.encode()).to.equal('blob 6\0foobar')
      })
    })

    describe('#contents', () => {
      it('should return raw blob data', () => {
        const i = ID.NULL
        const b = new Blob(i, 'foobar')
        expect(b.contents()).to.equal('foobar')
      })
    })
  })
})
