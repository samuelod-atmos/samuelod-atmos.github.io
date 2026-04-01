#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import BibTeX from "bibtex";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get BibTeX input from command line or file
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node bibtex-to-json.js <bibtex-file> [output-directory]");
  console.error("Example: node scripts/bibtex-to-json.js mypub.bib");
  process.exit(1);
}

const bibtexFile = args[0];
const outputDir = args[1] || path.join(__dirname, "../src/content/publications");

try {
  // Read BibTeX file
  if (!fs.existsSync(bibtexFile)) {
    console.error(`Error: File not found: ${bibtexFile}`);
    process.exit(1);
  }

  const bibtexContent = fs.readFileSync(bibtexFile, "utf-8");

  // Parse BibTeX
  const parsed = BibTeX.parseBibFile(bibtexContent);
  
  if (!parsed.content || parsed.content.length === 0) {
    console.error("Error: No BibTeX entries found in file");
    process.exit(1);
  }

  // Convert each entry to JSON
  parsed.content.forEach((entry) => {
    // Extract field values, handling the complex data structure
    const getFieldValue = (fieldData) => {
      if (!fieldData) return "";
      if (typeof fieldData === "string") return fieldData;
      if (fieldData.data && Array.isArray(fieldData.data)) {
        return fieldData.data.join("");
      }
      return "";
    };

    const fields = {};
    for (const [key, value] of Object.entries(entry.fields || {})) {
      fields[key.toLowerCase()] = getFieldValue(value);
    }

    // Create JSON structure matching schema
    const jsonData = {
      title: fields.title || "",
      author: fields.author || "",
      journal: fields.journal || "",
      year: fields.year || "",
      doi: fields.doi || "",
    };

    // Generate filename from first author and year
    const authors = jsonData.author.split(" and ");
    const firstAuthor = authors[0] || "unknown";
    const authorLastName = firstAuthor.split(",")[0].trim() || "unknown";
    const year = jsonData.year || "unknown";
    const filename = `${authorLastName.toLowerCase()}-${year}.json`;
    const filepath = path.join(outputDir, filename);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write JSON file
    fs.writeFileSync(filepath, JSON.stringify(jsonData, null, 2));
    console.log(`✓ Created: ${filepath}`);
  });

  console.log(`\nSuccessfully converted ${parsed.content.length} publication(s)`);
} catch (error) {
  console.error("Error parsing BibTeX:", error.message);
  process.exit(1);
}
