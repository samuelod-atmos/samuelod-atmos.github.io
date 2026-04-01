# BibTeX to JSON Conversion Script

This script automatically converts BibTeX format publications to JSON files for your Astro website.

## How to Use

1. **Get BibTeX from Google Scholar**
   - Go to Google Scholar
   - Find your publication
   - Click the quotation mark icon
   - Select "BibTeX"
   - Copy the BibTeX entry

2. **Create a temporary BibTeX file**
   - Create a file (e.g., `mypub.bib`)
   - Paste the BibTeX content
   - Save it in your project root or any directory

3. **Run the conversion script**
   ```bash
   npm run convert-bibtex mypub.bib
   ```

4. **Check the output**
   - The script creates a JSON file in `src/content/publications/`
   - Filename format: `lastname-year.json`
   - Delete the temporary `.bib` file

## Example

### Input BibTeX (mypub.bib)
```
@article{o2023look,
  title={Look up: Probing the vertical profile},
  author={O'Donnell, Samuel E and Smith, Jane},
  journal={Journal of Geophysical Research},
  year={2023},
  doi={10.1029/2022JD037525}
}
```

### Output JSON (odonnell-2023.json)
```json
{
  "title": "Look up: Probing the vertical profile",
  "author": "O'Donnell, Samuel E and Smith, Jane",
  "journal": "Journal of Geophysical Research",
  "year": "2023",
  "doi": "10.1029/2022JD037525"
}
```

## Notes

- The script automatically extracts the first author's last name for the filename
- You can convert multiple entries by including them all in the `.bib` file
- Each entry will create a separate JSON file
- Invalid BibTeX will show an error message
