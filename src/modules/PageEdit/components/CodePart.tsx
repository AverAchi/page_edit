import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { CodePartProps } from '../types';
import { pageApi } from '../api/pageApi';
import './CodePart.css';

const CodePart: React.FC<CodePartProps> = ({ content, language, onChange }) => {
    const [output, setOutput] = useState<string>('');
    const [isExecuting, setIsExecuting] = useState(false);

    const handleExecute = async () => {
        setIsExecuting(true);
        try {
            const result = await pageApi.executeCode({
                code: content,
                language: language || 'javascript'
            });
            setOutput(result.output);
        } catch (error) {
            setOutput('执行出错: ' + (error as Error).message);
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="code-part">
            <div className="code-editor">
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
            </div>
            <div className="code-actions">
                <button 
                    onClick={handleExecute} 
                    disabled={isExecuting}
                    className="execute-button"
                >
                    {isExecuting ? '执行中...' : '执行代码'}
                </button>
            </div>
            {output && (
                <div className="code-output">
                    <h4>输出结果：</h4>
                    <pre>{output}</pre>
                </div>
            )}
        </div>
    );
};

export default CodePart; 