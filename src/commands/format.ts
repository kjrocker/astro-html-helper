import { readFileSync, writeFileSync } from 'fs';

export function formatHtml(filePath: string, inPlace: boolean = false): string {
  try {
    const content = readFileSync(filePath, 'utf-8');
    console.log(`Formatting ${filePath}...`);
    
    // Basic HTML formatting logic
    const formatted = content
      .replace(/>\s*</g, '>\n<')
      .replace(/^\s+/gm, '')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
    
    if (inPlace) {
      writeFileSync(filePath, formatted, 'utf-8');
      console.log('✅ File formatted in place');
    } else {
      console.log('✅ Formatted content:');
      console.log(formatted);
    }
    
    return formatted;
  } catch (error) {
    console.error(`❌ Error formatting file: ${error}`);
    return '';
  }
}