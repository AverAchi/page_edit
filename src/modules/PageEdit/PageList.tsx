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
    const [isLoading, setIsLoading] = useState(false);

    // 获取用户的页面列表
    const fetchUserPages = async () => {
        setIsLoading(true);
        try {
            const userPages = await pageApi.getUserPages(userId);
            setPages(userPages);
        } catch (error) {
            console.error('获取页面列表失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 组件加载时获取页面列表
    useEffect(() => {
        fetchUserPages();
    }, [userId]);

    return (
        <div className="home-page">
            <div className="home-header">
                <h1>我的页面</h1>
                <button onClick={onCreatePage}>新建页面</button>
            </div>
            {isLoading ? (
                <div className="loading">加载中...</div>
            ) : (
                <div className="pages-grid">
                    {pages.map((page) => (
                        <div 
                            key={page.id} 
                            className="page-card"
                            onClick={() => onPageSelect(page)}
                        >
                            <h3>{page.title}</h3>
                            <p>{page.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PageList; 