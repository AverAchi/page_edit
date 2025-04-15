import React from 'react';
import { PartWrapperProps } from '../types';
import TextPart from './TextPart';
import CodePart from './CodePart';
import PdfPart from './PdfPart';

const PartWrapper: React.FC<PartWrapperProps> = ({ part, index, onUpdate, onDelete }) => {
    const handleContentChange = (content: string) => {
        onUpdate(part.id, { part_content: content });
    };

    return (
        <div className="part-wrapper">
            <div className="part-header">
                <span>{part.part_type.toUpperCase()} Part</span>
                <button onClick={() => onDelete(part.id)}>Delete</button>
            </div>
            {part.part_type === 'text' && (
                <TextPart content={part.part_content} onChange={handleContentChange} />
            )}
            {part.part_type === 'code' && (
                <CodePart
                    content={part.part_content}
                    language={part.metadata?.language || 'javascript'}
                    onChange={handleContentChange}
                />
            )}
            {part.part_type === 'pdf' && (
                <PdfPart
                    url={part.part_content}
                    fileName={part.metadata?.fileName}
                />
            )}
        </div>
    );
};

export default PartWrapper; 