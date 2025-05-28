import * as app from './app'
import * as auth from './auth'

export const tables = {
  ...auth,
  ...app
}
