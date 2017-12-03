import 'mocha'
import { expect } from 'chai'

import { ID } from '../src/models/object'
import { Commit } from '../src/models/commit'
import { Tree } from '../src/models/tree'
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

  describe('commit', () => {
    describe('#id', () => {
      it('should return the id', () => {
        const t = ID.NULL
        const c = new Commit(t, [], '', '')
        expect(c.id().toString()).to.equal('f84bcbf33618332cf64f2e6dd867bab18b94a860')
      })
    })

    describe('#type', () => {
      it('should return "commit"', () => {
        const t = ID.NULL
        const c = new Commit(t, [], '', '')
        expect(c.type()).to.equal('commit')
      })
    })

    describe('#size', () => {
      it('should return the number of characters in commit contents', () => {
        const t = new ID(repeat('abcd', 10))
        const p = new ID(repeat('1f2e', 10))
        const a = 'the author'
        const m = 'the message'
        const c = new Commit(t, [p], a, m)
        expect(c.size()).to.equal(125)
      })
    })

    describe('#encode', () => {
      it('should return the fully encoded commit', () => {
        const t = new ID(repeat('abcd', 10))
        const p = new ID(repeat('1f2e', 10))
        const a = 'the author'
        const m = 'the message'
        const c = new Commit(t, [p], a, m)
        expect(c.encode()).to.equal('commit 125\0'
          + 'tree abcdabcdabcdabcdabcdabcdabcdabcdabcdabcd\n'
          + 'parent 1f2e1f2e1f2e1f2e1f2e1f2e1f2e1f2e1f2e1f2e\n'
          + 'author the author\n\n'
          + 'the message\n')
      })
    })

    describe('#contents', () => {
      it('should return formatted tree data', () => {
        const t = new ID(repeat('abcd', 10))
        const p = new ID(repeat('1f2e', 10))
        const a = 'the author'
        const m = 'the message'
        const c = new Commit(t, [p], a, m)
        expect(c.contents()).to.equal(''
          + 'tree abcdabcdabcdabcdabcdabcdabcdabcdabcdabcd\n'
          + 'parent 1f2e1f2e1f2e1f2e1f2e1f2e1f2e1f2e1f2e1f2e\n'
          + 'author the author\n\n'
          + 'the message\n')
      })
    })
  })

  describe('tree', () => {
    describe('#id', () => {
      it('should return the id', () => {
        const t = new Tree([])
        expect(t.id().toString()).to.equal('4b825dc642cb6eb9a060e54bf8d69288fbee4904')
      })
    })

    describe('#type', () => {
      it('should return "tree"', () => {
        const t = new Tree([])
        expect(t.type()).to.equal('tree')
      })
    })

    describe('#size', () => {
      it('should return the number of characters in tree contents', () => {
        const t = new Tree([
          {name: 'foo', id: new ID(repeat('abcd', 10))},
          {name: 'bar', id: new ID(repeat('abcd', 10))},
        ])
        expect(t.size()).to.equal(t.contents().length)
      })
    })

    describe('#encode', () => {
      it('should return the fully encoded tree', () => {
        const t = new Tree([
          {name: 'foo', id: new ID(repeat('abcd', 10))},
          {name: 'bar', id: new ID(repeat('abcd', 10))},
        ])
        expect(t.encode()).to.equal('tree 88\0'
          + 'foo\0abcdabcdabcdabcdabcdabcdabcdabcdabcdabcd'
          + 'bar\0abcdabcdabcdabcdabcdabcdabcdabcdabcdabcd')
      })
    })

    describe('#contents', () => {
      it('should return formatted tree data', () => {
        const t = new Tree([
          {name: 'foo', id: new ID(repeat('abcd', 10))},
          {name: 'bar', id: new ID(repeat('abcd', 10))},
        ])
        expect(t.contents()).to.equal(''
          + 'foo\0abcdabcdabcdabcdabcdabcdabcdabcdabcdabcd'
          + 'bar\0abcdabcdabcdabcdabcdabcdabcdabcdabcdabcd')
      })
    })
  })

  describe('blob', () => {
    describe('#id', () => {
      it('should return the id', () => {
        const b = new Blob('foobar')
        expect(b.id().toString()).to.equal('f6ea0495187600e7b2288c8ac19c5886383a4632')
      })
    })

    describe('#type', () => {
      it('should return "blob"', () => {
        const b = new Blob('foobar')
        expect(b.type()).to.equal('blob')
      })
    })

    describe('#size', () => {
      it('should return the number of characters in blob data', () => {
        const b = new Blob('foobar')
        expect(b.size()).to.equal('foobar'.length)
      })
    })

    describe('#encode', () => {
      it('should return the fully encoded blob', () => {
        const b = new Blob('foobar')
        expect(b.encode()).to.equal('blob 6\0foobar')
      })
    })

    describe('#contents', () => {
      it('should return raw blob data', () => {
        const b = new Blob('foobar')
        expect(b.contents()).to.equal('foobar')
      })
    })
  })
})
