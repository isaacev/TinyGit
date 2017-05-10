export interface TinyObject {
  type   (): string
  size   (): number
  pretty (): string
  encode (): string
  hash   (): string
}
