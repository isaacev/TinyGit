export interface TinyObject {
  type     (): string
  size     (): number
  contents (): string
  encode   (): string
  hash     (): string
  pretty   (): string
}
