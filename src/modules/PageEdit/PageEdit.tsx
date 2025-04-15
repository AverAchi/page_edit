import React, { useState } from 'react';
import { Page, Part } from './types';
import TextPart from './components/TextPart';
import CodePart from './components/CodePart';
import PdfPart from './components/PdfPart';
import { pageApi } from './api/pageApi';
import './PageEdit.css';

interface PageEditProps {
    page: Page;
    onSave: (updatedPage: Page) => void;
    onClose?: () => void;
}

const PageEdit: React.FC<PageEditProps> = ({ page, onSave, onClose }) => {
    const [title, setTitle] = useState(page.title);
    const [description, setDescription] = useState(page.description);
    const [parts, setParts] = useState<Part[]>(page.parts || []);
    const [isSaving, setIsSaving] = useState(false);

    // 更新页面基本信息
    const handlePageInfoChange = (field: 'title' | 'description', value: string) => {
        if (field === 'title') {
            setTitle(value);
        } else {
            setDescription(value);
        }
    };

    // 添加新的部分
    const handleAddPart = (type: 'text' | 'code' | 'pdf') => {
        const newPart: Part = {
            id: '', // 新创建的 part 还没有 id
            part_index: parts.length,
            part_type: type,
            part_content: '',
            metadata: type === 'code' ? { language: 'javascript' } : undefined
        };
        setParts([...parts, newPart]);
    };

    // 删除页面部分
    const handleDeletePart = async (partId: string) => {
        try {
            await pageApi.deletePagePart(partId);
            setParts(parts.filter(part => part.id !== partId));
        } catch (error) {
            console.error('删除部分失败:', error);
        }
    };

    // 保存页面部分
    const savePart = async (part: Part) => {
        if (!page) return null;
        try {
            if (!part.id) {
                // 新部分，需要创建
                const response = await pageApi.createPagePart({
                    page_id: page.id,
                    part_index: part.part_index,
                    part_type: part.part_type,
                    part_content: part.part_content,
                    meta_data: part.metadata ? JSON.stringify(part.metadata) : undefined
                });
                return response;
            } else {
                // 更新现有部分
                const response = await pageApi.updatePagePart(part.id, {
                    part_index: part.part_index,
                    part_type: part.part_type,
                    part_content: part.part_content,
                    meta_data: part.metadata ? JSON.stringify(part.metadata) : undefined
                });
                return response;
            }
        } catch (error) {
            console.error('保存部分失败:', error);
            return null;
        }
    };

    // 保存整个页面
    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 保存页面基本信息
            await pageApi.updatePage(page.id, {
                title,
                description
            });

            // 保存所有部分
            const updatedParts = await Promise.all(
                parts.map(async (part) => {
                    const savedPart = await savePart(part);
                    return savedPart || part;
                })
            );

            // 通知父组件保存成功
            onSave({ ...page, title, description, parts: updatedParts });
        } catch (error) {
            console.error('保存页面失败:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="page-edit">
            <div className="page-header">
                <div className="page-info">
                    <input
                        type="text"
                        className="title-input"
                        value={title}
                        onChange={(e) => handlePageInfoChange('title', e.target.value)}
                        placeholder="页面标题"
                    />
                    <textarea
                        className="description-input"
                        value={description}
                        onChange={(e) => handlePageInfoChange('description', e.target.value)}
                        placeholder="页面描述"
                    />
                </div>
                <div className="page-actions">
                    <button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? '保存中...' : '保存'}
                    </button>
                    {onClose && (
                        <button onClick={onClose}>关闭</button>
                    )}
                </div>
            </div>
            <div className="page-content">
                <div className="add-part-buttons">
                    <button onClick={() => handleAddPart('text')}>添加文本</button>
                    <button onClick={() => handleAddPart('code')}>添加代码</button>
                    <button onClick={() => handleAddPart('pdf')}>添加PDF</button>
                </div>
                {Array.isArray(parts) && parts.map((part, index) => (
                    <div key={part.id || index} className="part-container">
                        <div className="part-actions">
                            <button 
                                className="delete-part-button"
                                onClick={() => handleDeletePart(part.id)}
                            >
                                删除
                            </button>
                        </div>
                        {(() => {
                            switch (part.part_type) {
                                case 'text':
                                    return (
                                        <TextPart
                                            content={part.part_content}
                                            onChange={(content) => {
                                                const updatedParts = [...parts];
                                                updatedParts[index] = {
                                                    ...part,
                                                    part_content: content
                                                };
                                                setParts(updatedParts);
                                            }}
                                        />
                                    );
                                case 'code':
                                    return (
                                        <CodePart
                                            content={part.part_content}
                                            language={part.metadata?.language || 'javascript'}
                                            onChange={(content) => {
                                                const updatedParts = [...parts];
                                                updatedParts[index] = {
                                                    ...part,
                                                    part_content: content
                                                };
                                                setParts(updatedParts);
                                            }}
                                        />
                                    );
                                case 'pdf':
                                    return (
                                        <PdfPart
                                            url={part.part_content}
                                            fileName={part.metadata?.fileName}
                                        />
                                    );
                                default:
                                    return null;
                            }
                        })()}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PageEdit;