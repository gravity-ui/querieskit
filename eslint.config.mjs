// eslint.config.mjs
import baseConfig from "@gravity-ui/eslint-config";
import prettierConfig from "@gravity-ui/eslint-config/prettier";
import reactConfig from "@gravity-ui/eslint-config/react";
import typescriptEslint from "@typescript-eslint/eslint-plugin";

export default [
    {
        ignores: [
            "build/**",
            "storybook-static/**",
            "node_modules/**",
            "dist/**",
            "*.config.mjs",
        ],
    },
    ...baseConfig,
    ...prettierConfig,
    ...reactConfig,
    {
        settings: {
            "import/resolver": {
                typescript: true,
                node: true
            }
        },
        plugins: {
            "@typescript-eslint": typescriptEslint,
        },
        rules: {
            curly: "off",
            "@typescript-eslint/explicit-member-accessibility": [
                "error",
                {
                    accessibility: "explicit",
                    overrides: {
                        accessors: "explicit",
                        constructors: "no-public",
                        methods: "explicit",
                        properties: "off",
                        parameterProperties: "explicit",
                    },
                },
            ],
        },
    },
    {
        files: ["src/stories/**/*.{ts,tsx}"],
        rules: {
            "import/no-extraneous-dependencies": "off",
        },
    },
];
