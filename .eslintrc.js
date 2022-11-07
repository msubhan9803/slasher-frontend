module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint/eslint-plugin"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "airbnb-base",
    "airbnb-typescript/base",
    "plugin:jest/recommended",
    "plugin:jest/style",
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [".eslintrc.js"],
  rules: {
    // Default NestJS rules
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    // Custom additions
    "max-lines": [
      "error",
      { max: 250, skipBlankLines: true, skipComments: true },
    ],
    "no-console": ["warn"],
    "@typescript-eslint/indent": "off",
    "max-len": ["warn", 140],
    // NestJS examples really seem to like named exports everywhere, so we'll disable the prefer-default-export rule
    "import/prefer-default-export": "off",
    "func-names": "off",
    "no-underscore-dangle": "off", // need to disable this because of Mongoose _id field
    "no-await-in-loop": "off", // might re-enable later, but disabling for now
    "no-restricted-syntax": "off", // might re-enable later, but disabling for now
    'jest/expect-expect': ['error', { 'assertFunctionNames': ['expect', 'request.**.expect'] }],
    "spaced-comment": "off",
  },
  overrides: [
    {
      files: ["*.spec.ts", "*.e2e-spec.ts"],
      rules: {
        "max-lines": [
          "error",
          { max: 350, skipBlankLines: true, skipComments: true },
        ],
      },
    },
  ],
};
