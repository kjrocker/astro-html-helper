# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run build` - Compile TypeScript to JavaScript in `dist/` directory
- `npm run dev` - Run TypeScript compiler in watch mode
- `npm test` - Run all Jest tests
- `npm test -- --testNamePattern="specific test"` - Run specific test by name

## Project Architecture

This is a CLI tool for transforming Astro files created from plain HTML. The architecture follows a pipeline pattern where transformations are chained together.

### Core Components

**CLI Entry Point** (`src/cli.ts`):
- Uses Commander.js for CLI interface
- Main command: `transform` with `-f` (file) or `-d` (directory) options
- Transform options: `--netlify-form`
- Only processes `.astro` files (validation enforced)

**Transform Pipeline** (`src/commands/format.ts`):
- `transformAstroFile()` orchestrates the transformation pipeline
- Uses `EditorChain` utility for chaining file operations
- Three configurable transforms applied in sequence:
  1. Netlify forms (disabled by default)
  2. Picture components (enabled by default) 
  3. Source extraction (enabled by default)

**EditorChain Pattern** (`src/utils/editor-chain.ts`):
- Fluent interface for file read → transform → write operations
- Chains multiple async transformations together
- Handles file I/O automatically

**Transform Functions** (`src/transforms/`):
- `netlifyFormsTransform`: Adds Netlify form attributes and reCAPTCHA
- `pictureTransform`: Converts HTML `<picture>` to Astro `<Picture>` components
- `sourceExtractionTransform`: Extracts `src` URLs to frontmatter variables

**AST Processing**:
- Uses `@astrojs/compiler` for parsing and serializing Astro files
- Uses `es-module-lexer` for import manipulation in frontmatter
- Transform functions operate on AST nodes, not string manipulation

### Key Dependencies

- `@astrojs/compiler` - AST parsing/serialization for Astro files
- `es-module-lexer` - Import statement analysis and modification
- `@optique/core` - CLI argument parsing
- `jest` + `ts-jest` - Testing framework

### File Processing Logic

- Single files: Must have `.astro` extension
- Directory processing: Recursively finds `.astro` files, ignores others
- All transformations modify files in-place
- Transform options control which pipeline steps are executed

### Testing

- Tests are co-located with source files (`.test.ts` suffix)
- Uses Node.js `assert` module for assertions (compatible with Jest)
- Each transform has comprehensive test coverage
- Tests use sample Astro file content with frontmatter
- Temporary test files are placed in the `scaffolding` directory

### Import Structure

The `import-lexer.ts` utility handles adding imports to frontmatter sections when transforms introduce new Astro components. This requires careful handling of the `es-module-lexer` async API.