type Line = {
  line : number
  text : string
}

type Transform = {
  x     : number
  y     : number
  prevX : number
  prevY : number
}

export type DiffLine = {
  which : 'same' | 'insert' | 'delete'
  old   : Line
  new   : Line
}

export const strings = (a: string, b: string) => {
  return diffLines(strToLines(a), strToLines(b))
}

const diffLines = (a: Line[], b: Line[]): DiffLine[] => {
  return Myers.diff(a, b)
}

const strToLines = (s: string) => {
  return s.split('\n').map((text, i) => ({ line: i+1, text }))
}

function mod (l, i) {
  return ((i % l) + l) % l
}

function idx<T> (v: T[], i: number): T {
  return v[mod(v.length, i)]
}

class Myers {
  static diff (a: Line[], b: Line[]) {
    return Myers.backtrack(a, b).reduce((diffs, transform) => {
      const lineA = a[transform.prevX]
      const lineB = b[transform.prevY]

      if (transform.x === transform.prevX) {
        diffs.unshift({ which: 'insert', old: null, new: lineB })
      } else if (transform.y === transform.prevY) {
        diffs.unshift({ which: 'delete', old: lineA, new: null })
      } else {
        diffs.unshift({ which: 'same', old: lineA, new: lineB })
      }

      return diffs
    }, [] as DiffLine[])
  }

  private static backtrack (a: Line[], b: Line[]): Transform[] {
    let x = a.length
    let y = b.length

    return Myers.shortestEdit(a, b).reverse().reduce((transforms, v, d, whole) => {
      d = whole.length - d - 1
      const k = x - y
      const prevK = ((k == -d || (k != d && idx(v, k-1) < idx(v, k+1)))
         ? k + 1
         : k - 1)
      const prevX = idx(v, prevK)
      const prevY = prevX - prevK

      while (x > prevX && y > prevY) {
        transforms.push({ prevX: x-1, prevY: y-1, x, y })
        x--
        y--
      }

      if (d > 0) {
        transforms.push({ prevX, prevY, x, y })
      }

      x = prevX
      y = prevY
      return transforms
    }, [] as Transform[])
  }

  private static shortestEdit (a: Line[], b: Line[]): number[][] {
    const n = a.length
    const m = b.length
    const max = n + m
    const v = (new Array(2 * max + 1) as number[]).fill(null)
    v[1] = 0
    const trace = [] as number[][]

    for (let d = 0; d <= max; d++) {
      trace.push(v.slice())
      for (let k = -d; k <= d; k += 2) {
        let x = 0
        let y = 0
        if (k == -d || (k != d && idx(v, k-1) < idx(v, k+1))) {
          x = idx(v, k+1)
        } else {
          x = idx(v, k-1) + 1
        }

        y = x - k

        while (x < n && y < m && a[x].text === b[y].text) {
          x++
          y++
        }

        v[mod(v.length, k)] = x

        if (x >= n && y >= m) {
          return trace
        }
      }
    }

    return trace
  }
}