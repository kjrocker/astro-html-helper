# astro-html-helper

A CLI tool for transforming Astro files created from plain HTML.

## Usage

### Transform a single file

```bash
npx astro-html-helper -f input.astro
```

### Transform all .astro files in a directory

```bash
npx astro-html-helper -d ./src/pages
```

### Download remote images while transforming

```bash
npx astro-html-helper -f page.astro --image-dir ./src/assets/images
```

### Transform directory with image downloads

```bash
npx astro-html-helper -d ./src/pages --image-dir ./src/assets/images
```

### Global installation (optional)

```bash
npm install -g astro-html-helper
astro-html-helper -f input.astro
```

### Transform options

- `--netlify-form` - Enable Netlify form transformations (disabled by default)
- `--image-dir <directory>` - Download remote images to specified directory and create imports

## Features

#### Image Download and Import (with `--image-dir`)

When the `--image-dir` option is provided, remote images are automatically downloaded and imported:

```bash
npx astro-html-helper transform -f page.astro --image-dir ./src/assets/images
```

**Before:**
```astro
---
---
<img src="https://example.com/hero-image.jpg" alt="Hero" />
```

**After:**
```astro
---
import heroImage from "./assets/images/hero-image.jpg";
---
<img src={heroImage} alt="Hero" />
```

This enables Astro's built-in image optimization for remote images by converting them to local imports.

**Key Features:**
- ✅ Only downloads remote URLs (http/https)
- ✅ Skips download if file already exists
- ✅ Preserves existing frontmatter content
- ✅ Works with `<img>`, `<Picture>`, `<Image>`, and `<source>` elements

### Netlify Forms

Adds Netlify form attributes and reCAPTCHA integration:

```html
<form netlify data-netlify-recaptcha="true">
  <!-- form content -->
  <div data-netlify-recaptcha="true"/>
  <button type="submit" />
</form>
```

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Watch mode
npm run dev
```