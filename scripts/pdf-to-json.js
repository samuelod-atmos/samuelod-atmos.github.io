#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pdfParse from "pdf-parse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get PDF input from command line or file
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node pdf-to-json.js <pdf-file> [output-file]");
  console.error("Example: node scripts/pdf-to-json.js public/cv.pdf");
  process.exit(1);
}

const pdfFile = args[0];
const outputFile = args[1] || path.join(__dirname, "../src/content/cv.json");

try {
  // Check if PDF exists
  if (!fs.existsSync(pdfFile)) {
    console.error(`Error: File not found: ${pdfFile}`);
    process.exit(1);
  }

  // Read PDF file
  const pdfBuffer = fs.readFileSync(pdfFile);

  // Parse PDF
  pdfParse(pdfBuffer).then((data) => {
    // Extract text and create structured data
    const cvText = data.text;

    // Parse sections from PDF text
    // This is a basic parser - you may need to customize based on your CV format
    const sections = parseCV(cvText);

    // Create output structure
    const cvData = {
      extractedAt: new Date().toISOString(),
      totalPages: data.numpages,
      sections: sections,
      rawText: cvText.substring(0, 1000) + "...", // Store first 1000 chars as preview
    };

    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write JSON file
    fs.writeFileSync(outputFile, JSON.stringify(cvData, null, 2));
    console.log(`✓ CV extracted to: ${outputFile}`);
    console.log(`  Pages: ${data.numpages}`);
    console.log(`  Sections found: ${sections.length}`);
  });
} catch (error) {
  console.error("Error parsing PDF:", error.message);
  process.exit(1);
}

/**
 * Parse CV text into structured sections
 * Customize this based on your CV format
 */
function parseCV(text) {
  const sections = [];
  const lines = text.split("\n").filter((line) => line.trim());

  let currentSection = null;
  const commonHeaders = [
    "experience",
    "education",
    "skills",
    "publications",
    "projects",
    "summary",
    "about",
    "contact",
  ];

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();

    // Check if line is a section header
    const matchedHeader = commonHeaders.find(
      (header) => lowerLine.startsWith(header) || lowerLine.includes(header)
    );

    if (matchedHeader) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: line.trim(),
        content: [],
      };
    } else if (currentSection && line.trim() !== "") {
      currentSection.content.push(line.trim());
    }
  }

  // Add last section
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}
