import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import MonacoEditor from '@monaco-editor/react';
import { Document, Page as PdfPage } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import './WebIDE.css';

// 定义 Part 类型，适配后端 PagePart 实体
interface Part {
    id: string;
    part_type: 'text' | 'code' | 'pdf';
    part_content: string;
    part_index: number;
    metadata?: { language?: string; fileName?: string };
}

// 定义页面类型，适配后端 Page 实体
export interface Page {
    id: string;
    title: string;
    description: string;
    parts: Part[];
}

// WebIDE 的 Props，方便父项目传递数据和回调
interface WebIDEProps {
    page: Page;
    onSave: (updatedPage: Page) => void;
    onClose?: () => void;
}

// 文字 Part 组件
const TextPart: React.FC<{
    content: string;
    onChange: (content: string) => void;
}> = ({ content, onChange }) => {
    return (
        <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="part-text"
            placeholder="Enter text content..."
        />
    );
};

// 代码 Part 组件
const CodePart: React.FC<{
    content: string;
    language: string;
    onChange: (content: string) => void;
}> = ({ content, language, onChange }) => {
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

// PDF Part 组件
const PdfPart: React.FC<{
    url: string;
    fileName?: string;
}> = ({ url, fileName }) => {
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

// 单个 Part 包装组件
const PartWrapper: React.FC<{
    part: Part;
    index: number;
    onUpdate: (id: string, updates: Partial<Part>) => void;
    onDelete: (id: string) => void;
}> = ({ part, index, onUpdate, onDelete }) => {
    const handleContentChange = (content: string) => {
        onUpdate(part.id, { part_content: content });
    };

    return (
        <Draggable draggableId={part.id} index={index}>
            {(provided) => (
                <div
                    className="part-wrapper"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
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
            )}
        </Draggable>
    );
};

// 主 WebIDE 组件
const WebIDE: React.FC<WebIDEProps> = ({ page, onSave, onClose }) => {
    const [parts, setParts] = useState<Part[]>(page.parts.sort((a, b) => a.part_index - b.part_index));

    // 添加新 Part
    const addPart = (type: 'text' | 'code' | 'pdf') => {
        const newPart: Part = {
            id: `part-${Date.now()}`,
            part_type: type,
            part_content: type === 'text' ? '' : type === 'code' ? '// Your code here' : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            part_index: parts.length + 1,
            metadata: type === 'code' ? { language: 'javascript' } : type === 'pdf' ? { fileName: 'dummy.pdf' } : undefined,
        };
        setParts([...parts, newPart]);
    };

    // 更新 Part
    const updatePart = (id: string, updates: Partial<Part>) => {
        setParts(parts.map((part) => (part.id === id ? { ...part, ...updates } : part)));
    };

    // 删除 Part
    const deletePart = (id: string) => {
        setParts(parts.filter((part) => part.id !== id));
    };

    // 拖拽结束
    const onDragEnd = useCallback((result: DropResult) => {
        if (!result.destination) return;
        const reorderedParts = Array.from(parts);
        const [movedPart] = reorderedParts.splice(result.source.index, 1);
        reorderedParts.splice(result.destination.index, 0, movedPart);
        const updatedParts = reorderedParts.map((part, index) => ({
            ...part,
            part_index: index + 1,
        }));
        setParts(updatedParts);
    }, [parts]);

    // 保存页面
    const handleSave = () => {
        onSave({ ...page, parts });
    };

    return (
        <div className="web-ide">
            <div className="ide-header">
                <h2>{page.title}</h2>
                <div>
                    <button onClick={() => addPart('text')}>Add Text</button>
                    <button onClick={() => addPart('code')}>Add Code</button>
                    <button onClick={() => addPart('pdf')}>Add PDF</button>
                    <button onClick={handleSave}>Save</button>
                    {onClose && <button onClick={onClose}>Close</button>}
                </div>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="parts">
                    {(provided) => (
                        <div
                            className="parts-list"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {parts.map((part, index) => (
                                <PartWrapper
                                    key={part.id}
                                    part={part}
                                    index={index}
                                    onUpdate={updatePart}
                                    onDelete={deletePart}
                                />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default WebIDE;