export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
};

export type Comment = Node & {
  __typename?: 'Comment';
  content: Scalars['String']['output'];
  createdAt: Scalars['Date']['output'];
  formFieldId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  memberId: Scalars['String']['output'];
  reviewFlowId: Scalars['String']['output'];
  user: User;
};

export type CreateCommentInput = {
  content: Scalars['String']['input'];
  formFieldId?: InputMaybe<Scalars['String']['input']>;
  reviewFlowId: Scalars['String']['input'];
};

export type CreateFormInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  fields: Array<FormFieldInput>;
  title: Scalars['String']['input'];
};

export type CreateFormTemplateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  fields: Array<FormTemplateFieldInput>;
  name: Scalars['String']['input'];
};

export type CreateOrganizationInput = {
  logo?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type CreateReviewFlowInput = {
  formId: Scalars['String']['input'];
};

export type Form = Node & {
  __typename?: 'Form';
  createdAt: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  fields: Array<FormField>;
  id: Scalars['ID']['output'];
  status: FormStatus;
  title: Scalars['String']['output'];
  updatedAt: Scalars['Date']['output'];
  version: Scalars['Int']['output'];
};

export type FormField = Node & {
  __typename?: 'FormField';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  options?: Maybe<Scalars['String']['output']>;
  order: Scalars['Int']['output'];
  required: Scalars['Boolean']['output'];
  status: FormFieldStatus;
  type: FormFieldTypeEnum;
  value?: Maybe<Scalars['String']['output']>;
};

export type FormFieldInput = {
  id?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  options?: InputMaybe<Scalars['String']['input']>;
  order: Scalars['Int']['input'];
  required: Scalars['Boolean']['input'];
  type: FormFieldTypeEnum;
};

export enum FormFieldStatus {
  Approved = 'approved',
  Draft = 'draft',
  Rejected = 'rejected'
}

export enum FormFieldType {
  Checkbox = 'checkbox',
  Date = 'date',
  File = 'file',
  Number = 'number',
  Radio = 'radio',
  Select = 'select',
  Text = 'text',
  Textarea = 'textarea'
}

export enum FormFieldTypeEnum {
  Checkbox = 'checkbox',
  Date = 'date',
  File = 'file',
  Number = 'number',
  Radio = 'radio',
  Select = 'select',
  Text = 'text',
  Textarea = 'textarea'
}

export enum FormStatus {
  Approved = 'approved',
  Draft = 'draft',
  NeedsChanges = 'needs_changes',
  Rejected = 'rejected',
  UnderReview = 'under_review'
}

export type FormTemplate = Node & {
  __typename?: 'FormTemplate';
  createdAt: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  fields: Array<FormTemplateField>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['Date']['output'];
  version: Scalars['Int']['output'];
};

export type FormTemplateField = Node & {
  __typename?: 'FormTemplateField';
  defaultValue?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  options?: Maybe<Scalars['String']['output']>;
  order: Scalars['Int']['output'];
  required: Scalars['Boolean']['output'];
  type: FormFieldType;
  validationRules?: Maybe<Scalars['String']['output']>;
};

export type FormTemplateFieldInput = {
  defaultValue?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  options?: InputMaybe<Scalars['String']['input']>;
  order: Scalars['Int']['input'];
  required: Scalars['Boolean']['input'];
  type: FormFieldType;
  validationRules?: InputMaybe<Scalars['String']['input']>;
};

export type InviteMemberInput = {
  email: Scalars['String']['input'];
  organizationId: Scalars['String']['input'];
  role: MemberRole;
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Member = Node & {
  __typename?: 'Member';
  createdAt: Scalars['Date']['output'];
  id: Scalars['ID']['output'];
  organization: Organization;
  organizationId: Scalars['String']['output'];
  role: MemberRole;
  userId: Scalars['String']['output'];
};

export enum MemberRole {
  Executor = 'executor',
  Member = 'member',
  Owner = 'owner',
  Reviewer = 'reviewer'
}

/** The root mutation type */
export type Mutation = {
  __typename?: 'Mutation';
  addComment: Comment;
  createForm: Form;
  createFormTemplate: FormTemplate;
  createOrganization: Organization;
  createReviewFlow: ReviewFlow;
  deleteComment: Scalars['Boolean']['output'];
  deleteFormTemplate: Scalars['Boolean']['output'];
  inviteMember: Scalars['Boolean']['output'];
  login: User;
  logout: Scalars['Boolean']['output'];
  register: User;
  /** Set the active organization for the current user. */
  setActiveOrganization: Scalars['Boolean']['output'];
  updateFormTemplate: FormTemplate;
  updateOrganization: Organization;
  updateReviewFlow: ReviewFlow;
};


/** The root mutation type */
export type MutationAddCommentArgs = {
  input: CreateCommentInput;
};


/** The root mutation type */
export type MutationCreateFormArgs = {
  input: CreateFormInput;
};


/** The root mutation type */
export type MutationCreateFormTemplateArgs = {
  input: CreateFormTemplateInput;
};


/** The root mutation type */
export type MutationCreateOrganizationArgs = {
  input: CreateOrganizationInput;
};


/** The root mutation type */
export type MutationCreateReviewFlowArgs = {
  input: CreateReviewFlowInput;
};


/** The root mutation type */
export type MutationDeleteCommentArgs = {
  id: Scalars['String']['input'];
};


/** The root mutation type */
export type MutationDeleteFormTemplateArgs = {
  id: Scalars['String']['input'];
};


/** The root mutation type */
export type MutationInviteMemberArgs = {
  input: InviteMemberInput;
};


/** The root mutation type */
export type MutationLoginArgs = {
  input: LoginInput;
};


/** The root mutation type */
export type MutationRegisterArgs = {
  input: RegisterInput;
};


/** The root mutation type */
export type MutationSetActiveOrganizationArgs = {
  organizationId: Scalars['String']['input'];
};


/** The root mutation type */
export type MutationUpdateFormTemplateArgs = {
  id: Scalars['String']['input'];
  input: UpdateFormTemplateInput;
};


/** The root mutation type */
export type MutationUpdateOrganizationArgs = {
  id: Scalars['String']['input'];
  input: UpdateOrganizationInput;
};


/** The root mutation type */
export type MutationUpdateReviewFlowArgs = {
  id: Scalars['String']['input'];
  input: UpdateReviewFlowInput;
};

export type Node = {
  id: Scalars['ID']['output'];
};

export type Organization = Node & {
  __typename?: 'Organization';
  createdAt: Scalars['Date']['output'];
  id: Scalars['ID']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  members: Array<Member>;
  name: Scalars['String']['output'];
  slug?: Maybe<Scalars['String']['output']>;
};

/** The root query type */
export type Query = {
  __typename?: 'Query';
  fieldComments: Array<Comment>;
  form: Form;
  formReviewFlows: Array<ReviewFlow>;
  formTemplate: FormTemplate;
  formTemplates: Array<FormTemplate>;
  forms: Array<Form>;
  me: User;
  node?: Maybe<Node>;
  nodes: Array<Maybe<Node>>;
  organization: Organization;
  organizationReviewFlows: Array<ReviewFlow>;
  organizations: Array<Organization>;
  reviewFlow: ReviewFlow;
  reviewFlowComments: Array<Comment>;
  /** Get the current user's session. */
  session: Session;
  users: Array<User>;
};


/** The root query type */
export type QueryFieldCommentsArgs = {
  formFieldId: Scalars['String']['input'];
  reviewFlowId: Scalars['String']['input'];
};


/** The root query type */
export type QueryFormArgs = {
  id: Scalars['String']['input'];
};


/** The root query type */
export type QueryFormReviewFlowsArgs = {
  formId: Scalars['String']['input'];
};


/** The root query type */
export type QueryFormTemplateArgs = {
  id: Scalars['String']['input'];
};


/** The root query type */
export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};


/** The root query type */
export type QueryNodesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


/** The root query type */
export type QueryOrganizationArgs = {
  id: Scalars['String']['input'];
};


/** The root query type */
export type QueryOrganizationReviewFlowsArgs = {
  organizationId: Scalars['String']['input'];
  status?: InputMaybe<ReviewFlowStatus>;
};


/** The root query type */
export type QueryReviewFlowArgs = {
  id: Scalars['String']['input'];
};


/** The root query type */
export type QueryReviewFlowCommentsArgs = {
  reviewFlowId: Scalars['String']['input'];
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type ReviewFlow = Node & {
  __typename?: 'ReviewFlow';
  comments: Array<Comment>;
  createdAt: Scalars['Date']['output'];
  form: Form;
  formId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastModifiedBy?: Maybe<Scalars['String']['output']>;
  organizationId: Scalars['String']['output'];
  status: ReviewFlowStatus;
  updatedAt: Scalars['Date']['output'];
  version: Scalars['Int']['output'];
};

export enum ReviewFlowStatus {
  Closed = 'closed',
  Open = 'open'
}

/** A session is a user's session on the platform. */
export type Session = Node & {
  __typename?: 'Session';
  activeOrganizationId?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  expiresAt?: Maybe<Scalars['Date']['output']>;
  id: Scalars['ID']['output'];
  impersonatedBy?: Maybe<Scalars['String']['output']>;
  ipAddress?: Maybe<Scalars['String']['output']>;
  token?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['Date']['output']>;
  userAgent?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type UpdateFormTemplateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  fields?: InputMaybe<Array<FormTemplateFieldInput>>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrganizationInput = {
  logo?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateReviewFlowInput = {
  status?: InputMaybe<ReviewFlowStatus>;
};

export type User = Node & {
  __typename?: 'User';
  banExpires?: Maybe<Scalars['Date']['output']>;
  banReason?: Maybe<Scalars['String']['output']>;
  banned?: Maybe<Scalars['Boolean']['output']>;
  createdAt: Scalars['Date']['output'];
  email: Scalars['String']['output'];
  emailVerified?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  members: Array<Member>;
  name: Scalars['String']['output'];
  role: Scalars['String']['output'];
  updatedAt: Scalars['Date']['output'];
};
