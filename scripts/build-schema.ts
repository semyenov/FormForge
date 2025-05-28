import { printSchema } from 'graphql';
import { resolve } from 'pathe'
import { writeFile } from 'fs/promises'
import { schema } from '../src/lib/graphql/schema';

const schemaFile = resolve(process.cwd(), 'schema.graphql');
writeFile(schemaFile, printSchema(schema));