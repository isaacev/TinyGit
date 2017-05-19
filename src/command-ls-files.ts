import { readIndexSync } from './io'

export function lsFiles (): string {
  return readIndexSync().pretty()
}
