/**
 * Advanced Import/Export Module for Markdown Studio
 * Handles DOCX, RTF, LaTeX, PDF import and multi-format export
 */

class ImportExportManager {
  constructor() {
    this.supportedImportFormats = ['.md', '.txt', '.html', '.docx', '.rtf', '.pdf'];
    this.supportedExportFormats = ['markdown', 'html', 'pdf', 'docx', 'rtf', 'latex'];
  }

  // Import functionality
  async importFile(file) {
    const extension = file.name.toLowerCase().substr(file.name.lastIndexOf('.'));
    
    switch (extension) {
      case '.md':
      case '.txt':
        return await this.importText(file);
      case '.html':
        return await this.importHTML(file);
      case '.docx':
        return await this.importDOCX(file);
      case '.rtf':
        return await this.importRTF(file);
      case '.pdf':
        return await this.importPDF(file);
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  }

  async importText(file) {
    return await file.text();
  }

  async importHTML(file) {
    const html = await file.text();
    return this.htmlToMarkdown(html);
  }

  async importDOCX(file) {
    // Load mammoth.js dynamically
    if (!window.mammoth) {
      await this.loadScript('https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js');
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    
    if (result.messages.length > 0) {
      console.warn('DOCX import warnings:', result.messages);
    }
    
    return this.htmlToMarkdown(result.value);
  }

  async importRTF(file) {
    // RTF is more complex - we'll convert what we can
    const text = await file.text();
    
    // Basic RTF to plain text conversion
    let content = text;
    
    // Remove RTF header and footer
    content = content.replace(/^{\\rtf1.*?\\fs\d+\s*/s, '');
    content = content.replace(/}$/, '');
    
    // Convert basic formatting
    content = content.replace(/\\b\s+(.*?)\\b0/g, '**$1**'); // Bold
    content = content.replace(/\\i\s+(.*?)\\i0/g, '*$1*'); // Italic
    content = content.replace(/\\par/g, '\n\n'); // Paragraphs
    content = content.replace(/\\'([0-9a-f]{2})/gi, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
    
    // Remove remaining RTF commands
    content = content.replace(/\\[a-z]+\d*\s*/gi, '');
    content = content.replace(/[{}]/g, '');
    
    return content.trim();
  }

  async importPDF(file) {
    // Load PDF.js dynamically
    if (!window.pdfjsLib) {
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    
    // Try to detect structure
    fullText = this.inferMarkdownStructure(fullText);
    
    return fullText.trim();
  }

  inferMarkdownStructure(text) {
    // Detect headings (lines that are all caps or followed by underlines)
    text = text.replace(/^([A-Z][A-Z\s]+)$/gm, (match, heading) => {
      return `# ${heading}`;
    });
    
    // Detect bullet points
    text = text.replace(/^[•·▪▫◦‣⁃]\s*(.+)$/gm, '- $1');
    
    // Detect numbered lists
    text = text.replace(/^(\d+)\.\s+(.+)$/gm, '$1. $2');
    
    // Clean up excessive whitespace
    text = text.replace(/\n{3,}/g, '\n\n');
    
    return text;
  }

  // Export functionality
  async exportAs(content, format, filename = 'document') {
    switch (format) {
      case 'markdown':
        return this.exportMarkdown(content, filename);
      case 'html':
        return this.exportHTML(content, filename);
      case 'pdf':
        return this.exportPDF(content, filename);
      case 'docx':
        return this.exportDOCX(content, filename);
      case 'rtf':
        return this.exportRTF(content, filename);
      case 'latex':
        return this.exportLaTeX(content, filename);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  exportMarkdown(content, filename) {
    const blob = new Blob([content], { type: 'text/markdown' });
    this.downloadFile(blob, `${filename}.md`);
  }

  exportHTML(content, filename) {
    const html = marked.parse(content);
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 { color: #2c3e50; margin-top: 24px; margin-bottom: 16px; }
    code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 16px; border-radius: 5px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #3498db; padding-left: 16px; margin: 16px 0; color: #555; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f4f4f4; font-weight: bold; }
    a { color: #3498db; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
    
    const blob = new Blob([fullHTML], { type: 'text/html' });
    this.downloadFile(blob, `${filename}.html`);
  }

  async exportPDF(content, filename) {
    if (!window.jspdf) {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        unit: 'mm',
        format: 'a4'
      });
      
      // Convert markdown to HTML first
      const html = marked.parse(content);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      let y = 20;
      const pageHeight = 280;
      const margin = 20;
      const lineHeight = 7;
      
      // Process content
      const processText = (text, fontSize = 12, isBold = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const lines = doc.splitTextToSize(text, 170);
        lines.forEach(line => {
          if (y > pageHeight) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += lineHeight;
        });
      };
      
      // Process each element
      Array.from(tempDiv.children).forEach(element => {
        const tagName = element.tagName.toLowerCase();
        const text = element.textContent.trim();
        
        if (!text) return;
        
        switch (tagName) {
          case 'h1':
            y += 5;
            processText(text, 18, true);
            y += 3;
            break;
          case 'h2':
            y += 4;
            processText(text, 16, true);
            y += 2;
            break;
          case 'h3':
            y += 3;
            processText(text, 14, true);
            y += 2;
            break;
          case 'p':
          default:
            processText(text);
            y += 2;
            break;
        }
      });
      
      doc.save(`${filename}.pdf`);
    }
  }

  async exportDOCX(content, filename) {
    // Load docx library dynamically
    if (!window.docx) {
      await this.loadScript('https://unpkg.com/docx@8.5.0/build/index.umd.js');
    }
    
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;
    
    // Parse markdown to structured data
    const lines = content.split('\n');
    const children = [];
    
    for (const line of lines) {
      if (line.startsWith('# ')) {
        children.push(
          new Paragraph({
            text: line.substring(2),
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 }
          })
        );
      } else if (line.startsWith('## ')) {
        children.push(
          new Paragraph({
            text: line.substring(3),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 }
          })
        );
      } else if (line.startsWith('### ')) {
        children.push(
          new Paragraph({
            text: line.substring(4),
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 240, after: 120 }
          })
        );
      } else if (line.trim()) {
        // Process inline formatting
        const runs = this.parseInlineFormatting(line);
        children.push(
          new Paragraph({
            children: runs,
            spacing: { after: 120 }
          })
        );
      }
    }
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    });
    
    const blob = await Packer.toBlob(doc);
    this.downloadFile(blob, `${filename}.docx`);
  }

  parseInlineFormatting(text) {
    const runs = [];
    let currentText = '';
    let isBold = false;
    let isItalic = false;
    
    // Simple parser for **bold** and *italic*
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/);
    
    parts.forEach(part => {
      if (part.startsWith('**') && part.endsWith('**')) {
        runs.push(new TextRun({
          text: part.slice(2, -2),
          bold: true
        }));
      } else if (part.startsWith('*') && part.endsWith('*')) {
        runs.push(new TextRun({
          text: part.slice(1, -1),
          italics: true
        }));
      } else if (part) {
        runs.push(new TextRun(part));
      }
    });
    
    return runs.length > 0 ? runs : [new TextRun(text)];
  }

  exportRTF(content, filename) {
    // Basic markdown to RTF conversion
    let rtf = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 ';
    
    const lines = content.split('\n');
    lines.forEach(line => {
      if (line.startsWith('# ')) {
        rtf += `\\fs32\\b ${this.escapeRTF(line.substring(2))}\\b0\\fs24\\par `;
      } else if (line.startsWith('## ')) {
        rtf += `\\fs28\\b ${this.escapeRTF(line.substring(3))}\\b0\\fs24\\par `;
      } else if (line.trim()) {
        // Handle inline formatting
        let formatted = line;
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '\\b $1\\b0 ');
        formatted = formatted.replace(/\*(.*?)\*/g, '\\i $1\\i0 ');
        rtf += `${this.escapeRTF(formatted)}\\par `;
      } else {
        rtf += '\\par ';
      }
    });
    
    rtf += '}';
    
    const blob = new Blob([rtf], { type: 'application/rtf' });
    this.downloadFile(blob, `${filename}.rtf`);
  }

  exportLaTeX(content, filename) {
    let latex = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{hyperref}
\\usepackage{graphicx}
\\usepackage{listings}

\\title{${filename}}
\\date{\\today}

\\begin{document}

\\maketitle

`;
    
    const lines = content.split('\n');
    let inCodeBlock = false;
    let inList = false;
    
    lines.forEach(line => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          latex += '\\end{lstlisting}\n';
          inCodeBlock = false;
        } else {
          latex += '\\begin{lstlisting}\n';
          inCodeBlock = true;
        }
      } else if (inCodeBlock) {
        latex += line + '\n';
      } else if (line.startsWith('# ')) {
        latex += `\\section{${this.escapeLaTeX(line.substring(2))}}\n`;
      } else if (line.startsWith('## ')) {
        latex += `\\subsection{${this.escapeLaTeX(line.substring(3))}}\n`;
      } else if (line.startsWith('### ')) {
        latex += `\\subsubsection{${this.escapeLaTeX(line.substring(4))}}\n`;
      } else if (line.startsWith('- ')) {
        if (!inList) {
          latex += '\\begin{itemize}\n';
          inList = true;
        }
        latex += `\\item ${this.escapeLaTeX(line.substring(2))}\n`;
      } else if (line.trim() === '' && inList) {
        latex += '\\end{itemize}\n\n';
        inList = false;
      } else if (line.trim()) {
        // Handle inline formatting
        let formatted = line;
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '\\textbf{$1}');
        formatted = formatted.replace(/\*(.*?)\*/g, '\\textit{$1}');
        formatted = formatted.replace(/`(.*?)`/g, '\\texttt{$1}');
        latex += `${this.escapeLaTeX(formatted)}\n\n`;
      }
    });
    
    if (inList) {
      latex += '\\end{itemize}\n';
    }
    
    latex += '\\end{document}';
    
    const blob = new Blob([latex], { type: 'text/plain' });
    this.downloadFile(blob, `${filename}.tex`);
  }

  // Utility methods
  htmlToMarkdown(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    let markdown = '';
    
    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }
      
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return '';
      }
      
      const tagName = node.tagName.toLowerCase();
      const children = Array.from(node.childNodes).map(processNode).join('');
      
      switch (tagName) {
        case 'h1': return `# ${children}\n\n`;
        case 'h2': return `## ${children}\n\n`;
        case 'h3': return `### ${children}\n\n`;
        case 'h4': return `#### ${children}\n\n`;
        case 'h5': return `##### ${children}\n\n`;
        case 'h6': return `###### ${children}\n\n`;
        case 'p': return `${children}\n\n`;
        case 'strong':
        case 'b': return `**${children}**`;
        case 'em':
        case 'i': return `*${children}*`;
        case 'code': return `\`${children}\``;
        case 'pre': return `\`\`\`\n${children}\n\`\`\`\n\n`;
        case 'a': 
          const href = node.getAttribute('href');
          return href ? `[${children}](${href})` : children;
        case 'ul':
        case 'ol':
          const items = Array.from(node.children);
          return items.map((item, index) => {
            const prefix = tagName === 'ol' ? `${index + 1}. ` : '- ';
            return prefix + processNode(item).trim();
          }).join('\n') + '\n\n';
        case 'li': return children;
        case 'blockquote': return `> ${children.trim()}\n\n`;
        case 'br': return '\n';
        default: return children;
      }
    };
    
    Array.from(temp.childNodes).forEach(node => {
      markdown += processNode(node);
    });
    
    // Clean up
    markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();
    
    return markdown;
  }

  escapeRTF(text) {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/{/g, '\\{')
      .replace(/}/g, '\\}');
  }

  escapeLaTeX(text) {
    return text
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/{/g, '\\{')
      .replace(/}/g, '\\}')
      .replace(/%/g, '\\%')
      .replace(/&/g, '\\&')
      .replace(/#/g, '\\#')
      .replace(/_/g, '\\_')
      .replace(/\$/g, '\\$');
  }

  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}

// Export for use in main editor
window.ImportExportManager = ImportExportManager;