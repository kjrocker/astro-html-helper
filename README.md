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

### Global installation (optional)

```bash
npm install -g astro-html-helper
astro-html-helper transform -f input.astro
```

### Transform options

- `--netlify-form` - Enable Netlify form transformations (disabled by default)
- `--no-pictures` - Disable picture component transformations
- `--no-picture-src-string` - Disable source extraction transformations

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

Extracts `src` attributes to frontmatter variables:

```astro
---
const image = "/images/photo.jpg";
---
<img src={image} alt="Photo" />
```

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

## License

ISC