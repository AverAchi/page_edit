import React, { useState, useEffect } from 'react';
import { Page } from './types';
import { pageApi } from './api/pageApi';
import './PageList.css';

interface PageListProps {
    userId: string;
    fileId: string;
    onPageSelect: (page: Page) => void;
    onCreatePage: () => void;
}

const PageList: React.FC<PageListProps> = ({ userId, fileId, onPageSelect, onCreatePage }) => {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 获取用户的所有页面
    const fetchPages = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // 1. 获取用户的所有页面
            const userPages = await pageApi.getUserPages(userId);
            
            // 2. 获取每个页面的基本信息
            const pagesWithDetails = await Promise.all(
                userPages.map(async (page: Page) => {
                    try {
                        const pageData = await pageApi.getPage(page.id);
                        return pageData;
                    } catch (error) {
                        console.error(`获取页面 ${page.id} 详情失败:`, error);
                        return page;
                    }
                })
            );
            
            setPages(pagesWithDetails);
        } catch (error) {
            console.error('获取页面列表失败:', error);
            setError('获取页面列表失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, [userId]);

    if (loading) {
        return <div className="loading">加载中...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="page-list">
            <div className="page-list-header">
                <h2>我的页面</h2>
                <button onClick={onCreatePage} className="create-page-button">
                    新建页面
                </button>
            </div>
            
            <div className="pages-container">
                {pages.map((page) => (
                    <div 
                        key={page.id} 
                        className="page-item"
                        onClick={() => onPageSelect(page)}
                    >
                        <h3>{page.title}</h3>
                        <p>{page.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PageList; 