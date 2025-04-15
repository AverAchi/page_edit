import React, { useState } from 'react';
import { PageList, PageEdit } from './modules/PageEdit';
import { Page } from './modules/PageEdit/types';
import { pageApi } from './modules/PageEdit/api/pageApi';

const TEST_USER_ID = '5fe866e2-5ced-43fb-b18d-7e169ef61d18'; // 测试用的固定 user_id
const TEST_FILE_ID = '5fe866e2-5ced-43fb-b18d-7e169ef61d18'; // 测试用的固定 file_id

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page | null>(null);

  // 创建新页面
  const handleCreatePage = async () => {
    try {
      // 1. 先创建页面，获取 page_id
      const newPage = await pageApi.createPage({
        title: '新页面',
        description: '新建页面描述',
        index: 1,
        file_id: TEST_FILE_ID
      });

      // 2. 获取完整页面数据（包括空 parts 数组）
      const pageData = await pageApi.getPage(newPage.id);
      const parts = await pageApi.getPagePartList(newPage.id);
      
      // 3. 合并数据并进入编辑模式
      const fullPage: Page = {
        ...pageData,
        parts: parts || []
      };
      
      setCurrentPage(fullPage);
    } catch (error) {
      console.error('创建页面失败:', error);
    }
  };

  // 选择页面
  const handlePageSelect = async (page: Page) => {
    try {
      // 1. 获取页面基本信息
      const pageData = await pageApi.getPage(page.id);
      // 2. 获取页面所有部分
      const parts = await pageApi.getPagePartList(page.id);
      
      // 3. 合并页面数据
      const fullPage: Page = {
        ...pageData,
        parts: parts || []
      };
      
      setCurrentPage(fullPage);
    } catch (error) {
      console.error('获取页面详情失败:', error);
    }
  };

  // 保存页面
  const handleSave = async (updatedPage: Page) => {
    try {
      // 1. 保存页面基本信息
      await pageApi.updatePage(updatedPage.id, {
        title: updatedPage.title,
        description: updatedPage.description
      });

      // 2. 保存所有部分
      const updatedParts = await Promise.all(
        updatedPage.parts.map(async (part) => {
          if (!part.id) {
            // 新部分，需要创建
            const response = await pageApi.createPagePart({
              page_id: updatedPage.id,
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
        })
      );

      // 3. 更新本地状态
      setCurrentPage({ ...updatedPage, parts: updatedParts });
    } catch (error) {
      console.error('保存页面失败:', error);
    }
  };

  // 关闭页面编辑器
  const handleClose = () => {
    setCurrentPage(null);
  };

  if (currentPage) {
    return (
      <div className="app">
        <PageEdit 
          page={currentPage}
          onSave={handleSave}
          onClose={handleClose}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <PageList 
        userId={TEST_USER_ID}
        fileId={TEST_FILE_ID}
        onPageSelect={handlePageSelect}
        onCreatePage={handleCreatePage}
      />
    </div>
  );
};

export default App; 