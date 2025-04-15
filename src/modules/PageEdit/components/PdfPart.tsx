import React from 'react';
import { PdfPartProps } from '../types';

const PdfPart: React.FC<PdfPartProps> = ({ url, fileName }) => {
    return (
        <div className="part-pdf">
            {fileName && <p>文件名: {fileName}</p>}
            <iframe
                src={url}
                title={fileName || 'PDF 预览'}
                width="100%"
                height="600px"
                style={{ border: 'none', borderRadius: '4px' }}
            />
        </div>
    );
};

export default PdfPart; 