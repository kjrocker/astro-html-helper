#!/usr/bin/env node

import { Command } from 'commander';
import { version } from '../package.json';

const program = new Command();

program
  .name('astro-html-helper')
  .description('CLI helper for Astro HTML manipulation')
  .version(version);

program
  .command('validate')
  .description('Validate HTML structure')
  .option('-f, --file <file>', 'HTML file to validate')
  .option('-d, --dir <directory>', 'Directory to validate')
  .action((options) => {
    console.log('Validating HTML...', options);
  });

program
  .command('format')
  .description('Format HTML files')
  .option('-f, --file <file>', 'HTML file to format')
  .option('-d, --dir <directory>', 'Directory to format')
  .option('-i, --in-place', 'Format files in place')
  .action((options) => {
    console.log('Formatting HTML...', options);
  });

program.parse();