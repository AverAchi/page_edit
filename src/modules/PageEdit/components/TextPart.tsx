import React from 'react';
import { TextPartProps } from '../types';

const TextPart: React.FC<TextPartProps> = ({ content, onChange }) => {
    return (
        <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="part-text"
            placeholder="Enter text content..."
        />
    );
};

export default TextPart; 