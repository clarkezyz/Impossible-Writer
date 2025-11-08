/**
 * REVOLUTIONARY TEMPLATES MODULE for Impossible Writer
 * The most comprehensive template system ever built for web editors
 * Handles document templates, code templates, and smart mode integration
 */

export class TemplateManager {
  constructor() {
    this.currentMode = 'write'; // 'write' or 'code'
    this.detectedLanguage = null;
    
    // WRITING TEMPLATES - Enhanced with Clarke's requested additions
    this.writingTemplates = {
      meeting: `# Meeting Notes
**Date:** ${new Date().toLocaleDateString()}  
**Attendees:** 

## Agenda
1. Review previous action items
2. Current project status
3. Key decisions needed
4. Next steps

## Notes
- 
- 
- 

## Action Items
| Task | Owner | Due Date | Status |
|------|-------|----------|--------|
|      |       |          |        |

## Next Meeting
Define next meeting date and objectives.`,

      project: `# Project Name

## Overview
Brief description of the project purpose and goals.

## Scope
### In Scope
- Feature 1: Description
- Feature 2: Description
- Feature 3: Description

### Out of Scope
- Item 1
- Item 2

### Technologies
- Technology 1: Purpose
- Technology 2: Purpose

### Architecture
High-level system design overview.

## Timeline
- **Phase 1** (Week 1-2): Initial setup
- **Phase 2** (Week 3-4): Core development
- **Phase 3** (Week 5-6): Testing & refinement

## Resources Needed
- Team member roles
- Tools and software
- Budget considerations

## Risks & Mitigation
1. **Risk**: Description
   **Mitigation**: Strategy`,

      blog: `# Your Title Here

*${new Date().toLocaleDateString()} · 5 min read*

## Introduction
Hook your readers with an engaging opening that sets up the problem or topic you're addressing.

## Main Content
### Section 1
Your first main point with supporting details and examples.

### Section 2
Second key point that builds on the first.

### Section 3
Third point that brings everything together.

## Key Takeaways
- Main point 1
- Main point 2
- Main point 3

## Conclusion
Wrap up with actionable insights or a compelling call-to-action.

---

*Thanks for reading! Feel free to [connect](../contact.html) if you have questions.*`,

      readme: `# Project Name

Brief description of what this project does.

## Installation

\`\`\`bash
git clone https://github.com/username/project
cd project
npm install
\`\`\`

## Usage

\`\`\`javascript
const example = require('./project');
example.run();
\`\`\`

## Features
- Feature 1: Description
- Feature 2: Description
- Feature 3: Description

## Configuration
Explain how to configure the project.

## API Documentation
### Methods
- \`method1()\`: Description
- \`method2(param)\`: Description

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License
MIT License - see LICENSE file for details.`,

      changelog: `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- New feature descriptions

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Now removed features

### Fixed
- Bug fixes

### Security
- In case of vulnerabilities

## [1.0.0] - ${new Date().toISOString().split('T')[0]}
### Added
- Initial release
- Core functionality`,

      task_list: `# Task List

## Today
- [ ] High priority task
- [ ] Another important item
- [ ] Meeting preparation

## This Week  
- [ ] Project milestone
- [ ] Code review
- [ ] Documentation update

## Backlog
- [ ] Future enhancement
- [ ] Research topic
- [ ] Nice-to-have feature

## Completed ✓
- [x] Previous task
- [x] Finished item

---
*Created: ${new Date().toLocaleDateString()}*`,

      brainstorm: `# Brainstorming Session

**Topic:** 
**Date:** ${new Date().toLocaleDateString()}
**Participants:** 

## Goal
What are we trying to achieve?

## Ideas 💡
- Idea 1: Description
- Idea 2: Description  
- Idea 3: Description

## Promising Concepts ⭐
1. **Concept A**
   - Why it works
   - Potential challenges
   
2. **Concept B**
   - Benefits
   - Implementation notes

## Action Items
- [ ] Research item 1
- [ ] Prototype idea
- [ ] Follow-up meeting

## Resources
- Link 1
- Link 2`,

      tutorial: `# How to [Topic]

**Difficulty:** Beginner/Intermediate/Advanced  
**Time Required:** X minutes  
**Prerequisites:** What you need to know

## Overview
Brief description of what this tutorial covers.

## Step 1: Getting Started
Explain the first step clearly.

\`\`\`code
// Example code
\`\`\`

## Step 2: Main Implementation
Detail the core process.

\`\`\`code
// More examples
\`\`\`

## Step 3: Final touches
Complete the tutorial.

## Common Issues
### Problem 1
**Solution:** How to fix it

### Problem 2  
**Solution:** Another fix

## What's Next?
- Additional resources
- Advanced topics
- Related tutorials`,

      release_notes: `# Release Notes v1.0.0

**Release Date:** ${new Date().toLocaleDateString()}

## 🎉 New Features
- **Feature Name**: Description of what it does and why it's useful
- **Another Feature**: More details about functionality

## 🔧 Improvements  
- Enhanced performance in area X
- Better error messages
- UI/UX improvements

## 🐛 Bug Fixes
- Fixed issue with component Y
- Resolved problem in workflow Z
- Corrected edge case in feature A

## 🔄 Changes
- Updated dependency X to version Y
- Changed default behavior for Z

## 🚨 Breaking Changes
**⚠️ Important:** These changes may affect existing implementations:
- Change 1: What changed and how to adapt
- Change 2: Migration instructions

## 📦 Downloads
- [Latest Release](https://github.com/user/repo/releases/latest)
- [Documentation](https://docs.example.com)

## 🙏 Contributors
Thanks to everyone who contributed to this release!`
    };
  }

  getTemplate(name) {
    return this.templates[name] || '';
  }

  getAllTemplates() {
    return Object.keys(this.templates).map(key => ({
      id: key,
      name: this.formatTemplateName(key),
      description: this.getTemplateDescription(key),
      content: this.templates[key]
    }));
  }

  formatTemplateName(key) {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getTemplateDescription(key) {
    const descriptions = {
      meeting: 'Structured meeting notes with agenda and action items',
      project: 'Comprehensive project planning document',
      blog: 'Blog post template with SEO-friendly structure',
      readme: 'Standard README.md for GitHub repositories',
      changelog: 'Keep a Changelog format for version tracking',
      task_list: 'Organized task management with priorities',
      brainstorm: 'Creative brainstorming session template',
      tutorial: 'Step-by-step tutorial with code examples',
      release_notes: 'Professional release notes for software'
    };
    
    return descriptions[key] || 'Document template';
  }

  insertTemplate(templateName, editor) {
    const template = this.getTemplate(templateName);
    if (template && editor) {
      // Get current selection or cursor position
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const currentText = editor.value;
      
      // Insert template at cursor position or replace selection
      const beforeCursor = currentText.substring(0, start);
      const afterCursor = currentText.substring(end);
      
      // Add spacing if not at start of document
      const prefix = beforeCursor && !beforeCursor.endsWith('\n') ? '\n\n' : '';
      const suffix = afterCursor && !afterCursor.startsWith('\n') ? '\n\n' : '';
      
      const newContent = beforeCursor + prefix + template + suffix + afterCursor;
      
      editor.value = newContent;
      
      // Position cursor at start of inserted template
      const newCursorPos = start + prefix.length;
      editor.setSelectionRange(newCursorPos, newCursorPos);
      
      // Trigger input event for preview update
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      
      return true;
    }
    return false;
  }

  createTemplateModal() {
    const modal = document.createElement('div');
    modal.className = 'modal template-modal';
    modal.id = 'templateModal';
    
    const templates = this.getAllTemplates();
    const templateButtons = templates.map(template => `
      <div class="template-btn" data-template="${template.id}">
        <strong>${template.name}</strong>
        <span>${template.description}</span>
      </div>
    `).join('');

    modal.innerHTML = `
      <div class="modal-content">
        <h3>Choose a Template</h3>
        <div class="templates-grid">
          ${templateButtons}
        </div>
        <div class="modal-actions">
          <button class="btn" onclick="closeTemplateModal()">Cancel</button>
        </div>
      </div>
    `;

    // Add click handlers for template selection
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('template-btn') || e.target.parentElement.classList.contains('template-btn')) {
        const btn = e.target.classList.contains('template-btn') ? e.target : e.target.parentElement;
        const templateName = btn.dataset.template;
        
        if (templateName) {
          // Dispatch custom event with template selection
          modal.dispatchEvent(new CustomEvent('templateSelected', {
            detail: { templateName }
          }));
          modal.style.display = 'none';
        }
      }
    });

    // Close modal when clicking backdrop
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    return modal;
  }

  showTemplateModal() {
    let modal = document.getElementById('templateModal');
    if (!modal) {
      modal = this.createTemplateModal();
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    return modal;
  }

  // Quick templates for common use cases
  getQuickSnippets() {
    return {
      table: `| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`,
      
      checklist: `- [ ] Task 1
- [ ] Task 2  
- [ ] Task 3
- [x] Completed task`,

      code_block: '```javascript\n// Your code here\n```',
      
      quote: '> This is a blockquote\n> It can span multiple lines',
      
      link: '[Link text](https://example.com)',
      
      image: '![Alt text](image-url.jpg)',
      
      horizontal_rule: '---',
      
      details: `<details>
<summary>Click to expand</summary>

Hidden content goes here.

</details>`
    };
  }

  insertQuickSnippet(snippetName, editor) {
    const snippets = this.getQuickSnippets();
    const snippet = snippets[snippetName];
    
    if (snippet && editor) {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const currentText = editor.value;
      
      const beforeCursor = currentText.substring(0, start);
      const afterCursor = currentText.substring(end);
      
      editor.value = beforeCursor + snippet + afterCursor;
      
      // Position cursor appropriately
      let newCursorPos = start + snippet.length;
      
      // For certain snippets, position cursor in useful location
      if (snippetName === 'link') {
        newCursorPos = start + 1; // Inside the link text
      } else if (snippetName === 'code_block') {
        newCursorPos = start + snippet.indexOf('// Your code here');
      }
      
      editor.setSelectionRange(newCursorPos, newCursorPos);
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      
      return true;
    }
    return false;
  }
}