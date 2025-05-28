import { builder } from './builder';

// Import all types
import './types/User';
import './types/Form';
import './types/Auth';
import './types/Organization';
import './types/FormTemplate';
import './types/Comment';
import './types/ReviewFlow';
import './types/Session';

// Generate and export the schema
export const schema = builder.toSchema({});

