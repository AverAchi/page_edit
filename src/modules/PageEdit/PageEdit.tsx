import React, { useState } from 'react';
import { PageEditProps, Part, Page } from './types';
import PartWrapper from './components/PartWrapper';
import { pageApi } from './api/pageApi';
import './PageEdit.css';

const PageEdit: React.FC<PageEditProps> = ({ page, onSave, onClose }) => {
    const [currentPage, setCurrentPage] = useState<Page>(page);
    const [parts, setParts] = useState<Part[]>(page.parts.sort((a, b) => a.part_index - b.part_index));
    const [isSaving, setIsSaving] = useState(false);

    // 更新页面基本信息
    const handlePageInfoChange = (field: 'title' | 'description', value: string) => {
        setCurrentPage(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 保存页面部分
    const savePart = async (part: Part) => {
        if (!currentPage) return null;
        try {
            if (!part.id) {
                // 新部分，需要创建
                const response = await pageApi.createPagePart({
                    page_id: currentPage.id,
                    part_index: part.part_index,
                    part_type: part.part_type,
                    part_content: part.part_content,
                    meta_data: JSON.stringify(part.metadata)
                });
                return response.id;
            } else {
                // 更新现有部分
                await pageApi.updatePagePart(part.id, {
                    part_index: part.part_index,
                    part_content: part.part_content,
                    meta_data: JSON.stringify(part.metadata)
                });
                return part.id;
            }
        } catch (error) {
            console.error('保存部分失败:', error);
            return null;
        }
    };

    // 删除页面部分
    const deletePart = async (id: string) => {
        try {
            if (id) {
                await pageApi.deletePagePart(id);
            }
            setParts(parts.filter((part) => part.id !== id));
        } catch (error) {
            console.error('删除部分失败:', error);
        }
    };

    const addPart = (type: 'text' | 'code' | 'pdf') => {
        const newPart: Part = {
            id: '', // 初始为空，等待后端分配
            part_type: type,
            part_content: type === 'text' ? '' : type === 'code' ? '// Your code here' : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            part_index: parts.length + 1,
            metadata: type === 'code' ? { language: 'javascript' } : type === 'pdf' ? { fileName: 'dummy.pdf' } : undefined,
        };
        setParts([...parts, newPart]);
    };

    const updatePart = (id: string, updates: Partial<Part>) => {
        setParts(parts.map((part) => (part.id === id ? { ...part, ...updates } : part)));
    };

    // 保存整个页面
    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 保存页面基本信息
            await pageApi.updatePage(currentPage.id, {
                title: currentPage.title,
                description: currentPage.description
            });

            // 保存所有部分并更新 ID
            const updatedParts = await Promise.all(
                parts.map(async (part) => {
                    const newId = await savePart(part);
                    return newId ? { ...part, id: newId } : part;
                })
            );

            // 更新本地状态
            setParts(updatedParts);

            // 通知父组件保存成功
            onSave({ ...currentPage, parts: updatedParts });
        } catch (error) {
            console.error('保存页面失败:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="page-edit">
            <div className="edit-header">
                <div className="page-info-edit">
                    <input
                        type="text"
                        className="title-input"
                        value={currentPage.title}
                        onChange={(e) => handlePageInfoChange('title', e.target.value)}
                        placeholder="页面标题"
                    />
                    <textarea
                        className="description-input"
                        value={currentPage.description}
                        onChange={(e) => handlePageInfoChange('description', e.target.value)}
                        placeholder="页面描述"
                    />
                </div>
                <div className="button-group">
                    <button onClick={() => addPart('text')}>添加文本</button>
                    <button onClick={() => addPart('code')}>添加代码</button>
                    <button onClick={() => addPart('pdf')}>添加PDF</button>
                    <button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? '保存中...' : '保存'}
                    </button>
                    {onClose && <button onClick={onClose}>关闭</button>}
                </div>
            </div>
            <div className="parts-list">
                {parts.map((part, index) => (
                    <PartWrapper
                        key={part.id || `temp-${index}`}
                        part={part}
                        index={index}
                        onUpdate={updatePart}
                        onDelete={deletePart}
                    />
                ))}
            </div>
        </div>
    );
};

export default PageEdit;