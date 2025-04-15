import React, { useState } from 'react';
import { Document, Page as PdfPage } from 'react-pdf';
import { PdfPartProps } from '../types';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

const PdfPart: React.FC<PdfPartProps> = ({ url, fileName }) => {
    const [numPages, setNumPages] = useState<number | null>(null);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    return (
        <div className="part-pdf">
            {fileName && <p>File: {fileName}</p>}
            <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
                {numPages &&
                    Array.from(new Array(numPages), (_, index) => (
                        <PdfPage key={`page_${index + 1}`} pageNumber={index + 1} width={300} />
                    ))}
            </Document>
        </div>
    );
};

export default PdfPart; 