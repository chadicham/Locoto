const PDFDocument = require('pdfkit');
const fs = require('fs');

const generatePDF = (filePath, content) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);
        doc.text(content, 100, 100);
        doc.end();

        stream.on('finish', () => resolve(filePath));
        stream.on('error', (err) => reject(err));
    });
};

module.exports = { generatePDF };
