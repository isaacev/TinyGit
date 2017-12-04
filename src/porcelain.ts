import * as plumbing from './plumbing'

export const add = (filepath: string): void => {
  const blob = plumbing.hashObject(filepath, true)
  plumbing.addToIndex(blob, filepath)
}
