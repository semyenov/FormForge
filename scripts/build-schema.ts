import { writeFileSync } from 'fs';
import { printSchema } from 'graphql';
import { resolve } from 'pathe';
import { schema } from '../src/lib/graphql/schema';

const schemaFile = resolve(process.cwd(), 'schema.graphql');
writeFileSync(schemaFile, printSchema(schema));
