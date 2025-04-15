import React, { useState } from 'react';
import { PageEditProps, Part, Page } from './types';
import PartWrapper from './components/PartWrapper';
import { pageApi } from './api/pageApi';
import './PageEdit.css';

const PageEdit: React.FC<PageEditProps> = ({ onSave, onClose }) => {
    const [currentPage, setCurrentPage] = useState<Page | null>(null);
    const [parts, setParts] = useState<Part[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // 创建新页面
    const createNewPage = async () => {
        try {
            const newPage = await pageApi.createPage({
                title: '新页面',
                description: '新建页面描述',
                index: 1,
                file_id: '5fe866e2-5ced-43fb-b18d-7e169ef61d18'//just for test
            });
            setCurrentPage(newPage);
            setParts([]);
        } catch (error) {
            console.error('创建页面失败:', error);
        }
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
                // 更新本地状态，使用后端返回的 ID
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
        if (!currentPage) {
            alert('请先创建页面');
            return;
        }
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
        if (!currentPage) {
            alert('请先创建页面');
            return;
        }
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
                {currentPage ? (
                    <>
                        <h2>{currentPage.title}</h2>
                        <div className="button-group">
                            <button onClick={() => addPart('text')}>Add Text</button>
                            <button onClick={() => addPart('code')}>Add Code</button>
                            <button onClick={() => addPart('pdf')}>Add PDF</button>
                            <button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            {onClose && <button onClick={onClose}>Close</button>}
                        </div>
                    </>
                ) : (
                    <div className="new-page-section">
                        <button onClick={createNewPage}>+ 新建页面</button>
                    </div>
                )}
            </div>
            {currentPage && (
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
            )}
        </div>
    );
};

export default PageEdit;