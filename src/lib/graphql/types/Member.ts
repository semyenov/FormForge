import { builder } from '../builder';

export const memberRoleEnum = builder.enumType('MemberRole', {
  values: {
    owner: { value: 'owner' },
    reviewer: { value: 'reviewer' },
    executor: { value: 'executor' },
    member: { value: 'member' },
  },
});

// Define Member type
export const MemberType = builder.drizzleNode('members', {
  name: 'Member',
  id: { column: (member) => member.id },
  fields: (t) => ({
    role: t.expose('role', { type: memberRoleEnum }),
    createdAt: t.expose('createdAt', { type: 'Date' }),
    userId: t.exposeString('userId'),
    organizationId: t.exposeString('organizationId'),
    organization: t.relation('organization'),
  }),
});
