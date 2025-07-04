import { readFileSync } from 'fs';
import { join } from 'path';

export function validateHtml(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf-8');
    console.log(`Validating ${filePath}...`);
    
    // Basic HTML validation logic
    const hasDoctype = content.includes('<!DOCTYPE html>');
    const hasHtmlTag = content.includes('<html') && content.includes('</html>');
    const hasHeadTag = content.includes('<head') && content.includes('</head>');
    const hasBodyTag = content.includes('<body') && content.includes('</body>');
    
    if (!hasDoctype) {
      console.error('❌ Missing DOCTYPE declaration');
      return false;
    }
    
    if (!hasHtmlTag) {
      console.error('❌ Missing HTML tags');
      return false;
    }
    
    if (!hasHeadTag) {
      console.error('❌ Missing HEAD tags');
      return false;
    }
    
    if (!hasBodyTag) {
      console.error('❌ Missing BODY tags');
      return false;
    }
    
    console.log('✅ HTML structure is valid');
    return true;
  } catch (error) {
    console.error(`❌ Error reading file: ${error}`);
    return false;
  }
}