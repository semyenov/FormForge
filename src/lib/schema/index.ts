import * as app from './app'
import * as auth from './auth'

export const tables = {
  ...auth,
  ...app
}

export type Tables = typeof tables;

export type TableNames = keyof Tables;
export type Table = Tables[TableNames];
