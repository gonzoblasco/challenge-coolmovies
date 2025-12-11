import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: process.env.CODEGEN_SCHEMA_PATH || 'schema.json',
  documents: ['src/**/*.graphql', 'src/**/*.gql'],
  generates: {
    'src/generated/graphql.tsx': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-rtk-query',
      ],
    },
    'src/generated/graphql.schema.json': {
      plugins: ['introspection'],
    },
  },
  config: {
    inputValueDeprecation: true,
    importBaseApiFrom: '../state/api',
    exportHooks: true,
  },
};

export default config;
