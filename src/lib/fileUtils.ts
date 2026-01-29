import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import JSZip from 'jszip';

// Set worker source locally using Vite's asset handling
// @ts-ignore - Vite handled worker URL
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { performOCR } from './ai/ocrService';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// Supported file types
const TEXT_EXTENSIONS = ['.txt', '.md', '.markdown', '.csv', '.json', '.xml', '.html', '.htm', '.rtf'];
const SUPPORTED_MIMES = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ppt: 'application/vnd.ms-powerpoint',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel'
};

export async function extractTextFromFile(file: File): Promise<string> {
    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    // PDF
    if (fileType === SUPPORTED_MIMES.pdf || fileName.endsWith('.pdf')) {
        return extractPdfText(file);
    }

    // Word documents (.docx)
    if (fileType === SUPPORTED_MIMES.docx || fileName.endsWith('.docx')) {
        return extractDocxText(file);
    }

    // PowerPoint (.pptx)
    if (fileType === SUPPORTED_MIMES.pptx || fileName.endsWith('.pptx')) {
        return extractPptxText(file);
    }

    // Excel (.xlsx) - extract as CSV-like text
    if (fileType === SUPPORTED_MIMES.xlsx || fileName.endsWith('.xlsx')) {
        return extractXlsxText(file);
    }

    // Plain text, markdown, CSV, JSON, XML, HTML
    if (fileType.startsWith('text/') ||
        fileType === 'application/json' ||
        TEXT_EXTENSIONS.some(ext => fileName.endsWith(ext))) {
        return extractPlainText(file);
    }

    // Images - use OCR
    if (fileType.startsWith('image/')) {
        const base64 = await fileToBase64(file);
        return performOCR(base64, fileType);
    }

    // Legacy formats (.doc, .ppt, .xls) - not supported without server
    if (fileName.endsWith('.doc') || fileName.endsWith('.ppt') || fileName.endsWith('.xls')) {
        throw new Error(`Legacy Office format (${fileName.split('.').pop()}) not supported. Please convert to .docx, .pptx, or .xlsx`);
    }

    throw new Error(`Unsupported file type: ${fileType || fileName}`);
}

export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const parts = result.split(',');
            if (parts.length < 2) {
                reject(new Error("Invalid file content: could not extract base64 data"));
                return;
            }
            resolve(parts[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
}

export function getSupportedFileTypes(): string {
    return '.pdf,.docx,.pptx,.xlsx,.txt,.md,.csv,.json,.xml,.html,.jpg,.jpeg,.png,.gif,.webp';
}

// ==================== TEXT EXTRACTION ====================

async function extractPlainText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

async function extractPdfText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
        fullText += pageText + '\n\n';
    }

    return fullText.trim();
}

async function extractDocxText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
}

async function extractPptxText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    let fullText = '';
    const slideFiles: string[] = [];

    // Find all slide XML files
    zip.forEach((relativePath) => {
        if (relativePath.match(/^ppt\/slides\/slide\d+\.xml$/)) {
            slideFiles.push(relativePath);
        }
    });

    // Sort slides by number
    slideFiles.sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0');
        const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0');
        return numA - numB;
    });

    // Extract text from each slide
    for (const slidePath of slideFiles) {
        const slideXml = await zip.file(slidePath)?.async('string');
        if (slideXml) {
            const slideText = extractTextFromXml(slideXml);
            if (slideText) {
                fullText += `--- Slide ${slideFiles.indexOf(slidePath) + 1} ---\n${slideText}\n\n`;
            }
        }
    }

    return fullText.trim();
}

async function extractXlsxText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Get shared strings (text content)
    const sharedStringsFile = zip.file('xl/sharedStrings.xml');
    const sharedStrings: string[] = [];

    if (sharedStringsFile) {
        const xml = await sharedStringsFile.async('string');
        const matches = xml.matchAll(/<t[^>]*>([^<]*)<\/t>/g);
        for (const match of matches) {
            sharedStrings.push(match[1]);
        }
    }

    let fullText = '';
    const sheetFiles: string[] = [];

    // Find all sheet XML files
    zip.forEach((relativePath) => {
        if (relativePath.match(/^xl\/worksheets\/sheet\d+\.xml$/)) {
            sheetFiles.push(relativePath);
        }
    });

    sheetFiles.sort();

    // Extract data from each sheet
    for (const sheetPath of sheetFiles) {
        const sheetXml = await zip.file(sheetPath)?.async('string');
        if (sheetXml) {
            const sheetText = extractSheetText(sheetXml, sharedStrings);
            if (sheetText) {
                fullText += `--- Sheet ${sheetFiles.indexOf(sheetPath) + 1} ---\n${sheetText}\n\n`;
            }
        }
    }

    return fullText.trim();
}

// ==================== XML HELPERS ====================

function extractTextFromXml(xml: string): string {
    // Extract text from PowerPoint XML (a:t tags contain text)
    const textMatches = xml.matchAll(/<a:t>([^<]*)<\/a:t>/g);
    const texts: string[] = [];

    for (const match of textMatches) {
        const text = match[1].trim();
        if (text) {
            texts.push(text);
        }
    }

    return texts.join(' ');
}

function extractSheetText(xml: string, sharedStrings: string[]): string {
    const rows: string[] = [];

    // Find all rows
    const rowMatches = xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g);

    for (const rowMatch of rowMatches) {
        const cellTexts: string[] = [];
        const cellMatches = rowMatch[1].matchAll(/<c[^>]*(?:t="s")?[^>]*>[\s\S]*?<v>(\d+)<\/v>[\s\S]*?<\/c>|<c[^>]*>[\s\S]*?<v>([^<]*)<\/v>[\s\S]*?<\/c>/g);

        for (const cellMatch of cellMatches) {
            if (cellMatch[1] !== undefined) {
                // Shared string reference
                const idx = parseInt(cellMatch[1]);
                cellTexts.push(sharedStrings[idx] || '');
            } else if (cellMatch[2] !== undefined) {
                // Direct value
                cellTexts.push(cellMatch[2]);
            }
        }

        if (cellTexts.length > 0) {
            rows.push(cellTexts.join('\t'));
        }
    }

    return rows.join('\n');
}
