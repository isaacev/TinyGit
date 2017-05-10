export interface TinyObject {
  type   (): string
  size   (): number
  encode (): string
  hash   (): string
}
