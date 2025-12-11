# 📥 Download Feature - User Guide

## Overview

The UPSC AI platform now includes a powerful **note download feature** that allows users to download their generated study notes in multiple formats:

1. **PDF Format** - Professional formatted PDF for printing and offline reading
2. **Markdown Format** - Editable markdown text file for personal customization

---

## How to Use Download Feature

### Step 1: Generate or Open a Note

1. Navigate to **Live Scraper** or **Saved Notes**
2. Generate a new note or select an existing saved note
3. Click on the note to open the **Note Viewer** panel on the right

### Step 2: Click Download Button

In the note header (top-right area), you'll see a **Download button** (↓) with a dropdown arrow.

### Step 3: Choose Download Format

Click the download button to reveal two options:

#### Option A: Download as PDF
- **Recommended for**: Printing, sharing, and offline reading
- **Features**:
  - Professional A4 formatting
  - All content preserved (notes, MCQs, mains questions)
  - Ready to print
  - Maintains page breaks
  - Includes metadata (title, source, date, GS paper)

#### Option B: Download as Markdown
- **Recommended for**: Editing, version control, and integration
- **Features**:
  - Plain text format (.md)
  - Compatible with markdown editors
  - Can be imported into Obsidian, Notion, etc.
  - Version control friendly (Git compatible)
  - Preserves formatting

### Step 4: Confirm Download

The file will automatically download to your default Downloads folder with a descriptive filename based on the note title.

---

## File Naming Convention

Downloaded files are automatically named using the note title:

**Example:**
- Note Title: `Climate Change & National Action Plan`
- PDF Filename: `climate_change_national_action_plan.pdf`
- Markdown Filename: `climate_change_national_action_plan.md`

---

## PDF Download Features

### What's Included in PDF

The PDF contains:

1. **Header Section**
   - Note title
   - Source (The Hindu, PIB, etc.)
   - GS Paper classification (GS1-GS4, Prelims, Essay)
   - Generation date

2. **Executive Summary**
   - Quick overview of the topic
   - Highlighted in yellow box

3. **Detailed Notes**
   - Comprehensive markdown-formatted content
   - Proper text wrapping and formatting
   - All subsections preserved

4. **Mains Practice Question** (if available)
   - Question text in italics
   - Model answer key points as bullet list
   - Structured approach to answering

5. **Prelims MCQs** (if available)
   - Question with 4 options (A, B, C, D)
   - Marked answer
   - Detailed explanation for each question

### PDF Page Layout

- **Format**: A4 size (210mm × 297mm)
- **Margins**: 20mm on all sides
- **Font**: Arial 12pt for body text
- **Line Spacing**: 1.6x for readability
- **Color Coding**: Blue headings, yellow summary box, gray answer boxes

### PDF Quality

- **High Resolution**: 2x scaling for crisp text and images
- **Multi-page Support**: Automatically creates multiple pages if needed
- **Print-Ready**: Optimized for both screen viewing and printing

---

## Markdown Download Features

### What's Included in Markdown

The markdown file contains:

```markdown
# Note Title

**Source:** The Hindu | **GS Paper:** GS3
**Date:** 12/11/2025

## Summary
(100-150 word overview)

## Detailed Notes
(Full markdown-formatted content)

## Mains Question
"Question text here"

### Model Points
- Point 1
- Point 2
- Point 3

## MCQs
### Q1. Question text?
(A) Option A
(B) Option B
(C) Option C
(D) Option D

**Answer:** B
**Explanation:** Full explanation here...
```

### Use Cases for Markdown

1. **Personal Knowledge Base**
   - Import into Obsidian, Roam Research, or Logseq
   - Create interlinking between notes
   - Build personal UPSC wiki

2. **Version Control**
   - Track changes using Git
   - Compare versions over time
   - Collaborate with study partners

3. **Content Migration**
   - Export to Notion, OneNote, or Google Docs
   - Customize formatting as needed
   - Integrate with other tools

4. **Backup**
   - Keep local copies
   - Backup to cloud storage (Google Drive, Dropbox)
   - Preserve notes for future reference

---

## Troubleshooting

### PDF Download Issues

**Problem**: "Error generating PDF"
- **Solution**: Try closing other tabs and refreshing the page
- **Alternative**: Use Markdown format instead and convert externally

**Problem**: PDF is blank or incomplete
- **Solution**: 
  - Check if JavaScript is enabled in browser
  - Try a different browser
  - Ensure sufficient RAM available

**Problem**: PDF takes too long to generate
- **Solution**: 
  - It's normal for large notes (5-10 seconds)
  - Wait for "Generating PDF..." to complete
  - Don't close the browser tab during generation

### Markdown Download Issues

**Problem**: File won't open
- **Solution**: Ensure .md extension is correct
- **Note**: Open with any text editor (VS Code, Notepad++, etc.)

**Problem**: Special characters appear incorrectly
- **Solution**: 
  - Open file with UTF-8 encoding
  - In most editors: Right-click → Encoding → UTF-8

---

## Browser Compatibility

### Supported Browsers

| Browser | PDF | Markdown | Notes |
|---------|-----|----------|-------|
| Chrome | ✅ | ✅ | Recommended |
| Firefox | ✅ | ✅ | Works perfectly |
| Safari | ✅ | ✅ | May need to allow popups |
| Edge | ✅ | ✅ | Full support |
| Opera | ✅ | ✅ | Compatible |

### Known Issues

- **IE 11**: Not supported
- **Mobile Browsers**: PDF generation may be slow; Markdown works fine

---

## Tips & Best Practices

### For PDF Downloads

1. **Print to PDF** (Alternative method)
   - Print → Save as PDF
   - Gives you more control over formatting
   - Useful if PDF download fails

2. **Color Printing**
   - PDFs include color coding
   - Recommended to print in color for better readability
   - Blue headings, yellow summaries stand out better

3. **Organize Downloaded Files**
   - Create folders by GS paper (GS1/, GS2/, etc.)
   - Archive by month/topic
   - Backup to cloud storage

### For Markdown Downloads

1. **Markdown Editors to Use**
   - **VS Code** - Full-featured, free
   - **Obsidian** - Excellent for PKM
   - **Typora** - Beautiful markdown writing
   - **Notion** - Web-based, collaborative
   - **Google Docs** - Via markdown converter

2. **Converting Markdown to Other Formats**
   - **Pandoc**: Convert between formats
   - **Markdown Converters**: Online tools available
   - **IDE Plugins**: VS Code, Sublime Text extensions

3. **Sharing with Study Partners**
   - Push to GitHub for version control
   - Share via cloud storage
   - Use collaborative markdown editors

---

## Data & Privacy

### Downloads & Your Data

- ✅ **Local Processing**: All PDF generation happens in your browser
- ✅ **No Server Upload**: Your note content never leaves your device
- ✅ **No Analytics**: Download actions are not tracked
- ✅ **Your Property**: Downloaded files belong to you entirely

### File Storage

- Downloaded files are stored in your **Downloads** folder
- Files are NOT automatically deleted
- You have full ownership and control
- No DRM or restrictions

---

## Keyboard Shortcuts

### Quick Download (Coming Soon)

| Shortcut | Action |
|----------|--------|
| `Ctrl+P` | Print note (alternative to PDF) |
| `Ctrl+S` | Save note to database |
| Right-click | Show context menu options |

---

## Advanced Usage

### Batch Download (Multiple Notes)

1. **Current Limitation**: Download feature available per note
2. **Workaround**: 
   - Download each note individually
   - Use script to batch convert markdown to PDF

### Bulk Export

For exporting all your notes at once:

1. Go to **Saved Notes**
2. Select multiple notes (feature coming soon)
3. Click **Export All** (feature coming soon)

---

## FAQ

**Q: Can I edit the PDF after download?**
A: PDF files are not easily editable. Download as Markdown instead if you need to edit.

**Q: What's the file size limit?**
A: No practical limit. Even 50-page notes download quickly.

**Q: Can I download notes from deleted account?**
A: Only notes currently saved in your account. Deleted notes are permanently removed.

**Q: Is there a limit on downloads?**
A: No limits. Download as many times as needed.

**Q: Can I convert PDF to Markdown?**
A: Not directly from app. Use third-party tools like PDF-to-markdown converters online.

**Q: Does download include study progress?**
A: No. Downloads contain only note content. Progress data is app-only.

**Q: Can I schedule automatic downloads?**
A: Not yet. Manual download required for each note.

---

## Feature Roadmap

### Coming Soon (Phase 2)

- 📋 **Batch Download** - Download multiple notes at once
- 🔤 **Format Options** - Choose fonts, colors, layout
- 📧 **Email Export** - Send notes via email
- ☁️ **Cloud Sync** - Auto-backup to Google Drive, Dropbox
- 📚 **Ebook Format** - EPUB format for e-readers

### Planned (Phase 3)

- 🎨 **Custom Templates** - Design your own PDF layout
- 🗣️ **Audio Export** - Convert notes to MP3
- 📊 **Statistics** - Include study stats in downloads
- 🌐 **Web Version** - View downloaded notes in browser
- 🔐 **Password Protected PDFs** - Secure sensitive notes

---

## Support & Feedback

### Report Issues

If you encounter problems with downloads:

1. **Check Troubleshooting** section above
2. **Clear Browser Cache**: Ctrl+Shift+Delete
3. **Try Different Browser**: Firefox or Chrome
4. **Contact Support**: ayushkumar.inspire@gmail.com

### Feature Requests

Have ideas for download improvements?

- 📧 Email your suggestions
- 💬 Open GitHub issue
- 🎯 Vote on feature requests (coming soon)

---

**Last Updated**: December 11, 2025
**Version**: 1.0
**Status**: Active ✅
