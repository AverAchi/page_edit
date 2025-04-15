import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { CodePartProps } from '../types';

const CodePart: React.FC<CodePartProps> = ({ content, language, onChange }) => {
    return (
        <MonacoEditor
            height="200px"
            language={language || 'javascript'}
            value={content}
            onChange={(value) => onChange(value || '')}
            options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
            }}
        />
    );
};

export default CodePart; 