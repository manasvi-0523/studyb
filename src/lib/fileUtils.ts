import * as pdfjsLib from 'pdfjs-dist';

// Set worker source locally using Vite's asset handling
// @ts-ignore - Vite handled worker URL
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { performOCR } from './ai/ocrService';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractTextFromFile(file: File): Promise<string> {
    if (file.type === 'application/pdf') {
        return extractPdfText(file);
    } else if (file.type.startsWith('text/') || file.type === 'application/json') {
        return extractPlainText(file);
    } else if (file.type.startsWith('image/')) {
        const base64 = await fileToBase64(file);
        return performOCR(base64, file.type);
    }
    throw new Error(`Unsupported text file type: ${file.type}`);
}

export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data url prefix (e.g. "data:image/jpeg;base64,")
            const parts = result.split(',');
            if (parts.length < 2) {
                reject(new Error("Invalid file content: could not extract base64 data"));
                return;
            }
            const base64 = parts[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
}

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

    return fullText;
}
