import { extname } from "path";

export function getContentType(filename: string) {
    const ext = extname(filename).toLowerCase();
    switch (ext) {
        case '.txt': return 'text/plain';
        case '.html': return 'text/html';
        case '.css': return 'text/css';
        case '.js': return 'application/javascript';
        case '.json': return 'application/json';
        case '.png': return 'image/png';
        case '.jpg':
        case '.jpeg': return 'image/jpeg';
        case '.pdf': return 'application/pdf';
        default: return 'application/octet-stream';
    }
}