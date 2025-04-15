import React, { useState, useEffect } from 'react';
import { Page, Part } from './types';
import { pageApi } from './api/pageApi';
import './PageView.css';

interface PageViewProps {
    pageId: string;
    onEdit: () => void;
    onBack: () => void;
}

const PageView: React.FC<PageViewProps> = ({ pageId, onEdit, onBack }) => {
    const [page, setPage] = useState<Page | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPageData = async () => {
        setIsLoading(true);
        try {
            // 获取页面基本信息
            const pageData = await pageApi.getPage(pageId);
            // 获取页面所有部分
            const parts = await pageApi.getPagePartList(pageId);
            
            // 合并页面数据
            const fullPage: Page = {
                ...pageData,
                parts: parts.sort((a: Part, b: Part) => a.part_index - b.part_index)
            };
            
            setPage(fullPage);
        } catch (error) {
            console.error('获取页面失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPageData();
    }, [pageId]);

    if (isLoading) {
        return <div className="loading">加载中...</div>;
    }

    if (!page) {
        return <div className="error">页面加载失败</div>;
    }

    return (
        <div className="view-page">
            <div className="page-header">
                <div className="header-left">
                    <button className="back-button" onClick={onBack}>返回</button>
                    <h1>{page.title}</h1>
                </div>
                <button onClick={onEdit}>编辑页面</button>
            </div>
            <div className="page-content">
                {page.parts.map((part) => (
                    <div key={part.id} className="part-view">
                        <div className="part-type">{part.part_type.toUpperCase()}</div>
                        <div className="part-content">
                            {part.part_type === 'code' ? (
                                <pre>{part.part_content}</pre>
                            ) : (
                                part.part_content
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PageView; 