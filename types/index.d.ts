import 'express'

interface Locals {
  email: any
}

declare module 'express' {
  export interface Response {
    locals: Locals
  }
}
