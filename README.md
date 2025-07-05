# astro-html-helper

A CLI tool for transforming Astro files created from plain HTML.

## Usage

### Transform a single file

```bash
npx astro-html-helper transform -f input.astro
```

### Transform all .astro files in a directory

```bash
npx astro-html-helper transform -d ./src/pages
```

### Download remote images while transforming

```bash
npx astro-html-helper transform -f page.astro --image-dir ./src/assets/images
```

### Transform directory with image downloads

```bash
npx astro-html-helper transform -d ./src/pages --image-dir ./src/assets/images
```

### Global installation (optional)

```bash
npm install -g astro-html-helper
astro-html-helper transform -f input.astro
```

### Transform options

- `--netlify-form` - Enable Netlify form transformations (disabled by default)
- `--no-pictures` - Disable picture component transformations
- `--no-picture-src-string` - Disable source extraction transformations
- `--image-dir <directory>` - Download remote images to specified directory and create imports

## Features

### Picture Component Transformation

Converts HTML `<picture>` elements to Astro `<Picture>` components:

```html
<!-- Before -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>

<!-- After -->
<Picture src="image.jpg" alt="Description" />
```

### Source Extraction

Extracts `src` attributes to frontmatter variables for better asset management.

#### Standard Behavior

Creates variables for image URLs:

```astro
---
const image = "https://example.com/photo.jpg";
---
<img src={image} alt="Photo" />
```

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
<Picture src="https://cdn.example.com/banner.png" alt="Banner" />
```

**After:**
```astro
---
import heroImage from "./assets/images/hero-image.jpg";
import banner from "./assets/images/banner.png";
---
<img src={heroImage} alt="Hero" />
<Picture src={banner} alt="Banner" />
```

This enables Astro's built-in image optimization for remote images by converting them to local imports.

**Key Features:**
- ✅ Only downloads remote URLs (http/https)
- ✅ Skips download if file already exists
- ✅ Graceful fallback to variable declarations if download fails
- ✅ Generates clean, camelCase variable names from filenames
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