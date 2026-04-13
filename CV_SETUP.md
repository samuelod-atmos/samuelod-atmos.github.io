# CV Setup Guide

## How to Use

### 1. Add Your CV PDF
Place your CV PDF file in the `public/` folder with the name `cv.pdf`:
```
public/cv.pdf
```

### 2. Extract CV Content
Run this command to parse your PDF and extract the content:
```bash
npm run build-cv
```

This will:
- Read your `public/cv.pdf`
- Extract all text
- Parse it into sections (Experience, Education, Skills, etc.)
- Generate `src/content/cv.json` with the structured data

### 3. View Your CV Page
Your CV page is now available at:
```
http://localhost:3000/cv
```

The page displays:
- ✅ Extracted CV content organized by sections
- ✅ Download button for the full PDF
- ✅ Last updated timestamp

### 4. Update Workflow
When you update your CV:
1. Update `public/cv.pdf`
2. Run: `npm run build-cv`
3. Commit and push to GitHub
4. Your deployed site automatically updates!

## Build Process
The `npm run build` command now automatically:
1. Runs `npm run build-cv` to extract PDF content
2. Builds your Astro site
3. Deploys everything to GitHub

## Customization

### Parsing Logic
The PDF parsing script (`scripts/pdf-to-json.js`) looks for common section headers like:
- Experience
- Education
- Skills
- Publications
- Projects
- Summary
- About
- Contact

If your CV uses different headers, you can modify the `commonHeaders` array in `scripts/pdf-to-json.js`.

### Styling
The CV page uses these CSS variables (from your `theme.css`):
- `--accent-color` - For section headers and buttons
- `--accent-hover` - For button hover state
- `--heading-color` - For section titles

## Deployment Notes

- **GitHub Pages**: Works automatically - just commit your PDF
- **Vercel/Netlify**: Works automatically - the build process runs the script
- **Manual Hosting**: Run `npm run build` before deploying

## Troubleshooting

### "CV data not found" error
- Check that your PDF is at `public/cv.pdf`
- Run `npm run build-cv` to generate the JSON file
- Verify `src/content/cv.json` exists

### Sections not parsing correctly
- The parser looks for header keywords
- If sections aren't detected, the raw PDF link is still available
- You can manually edit `src/content/cv.json` if needed
