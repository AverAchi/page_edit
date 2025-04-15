import React, { useState } from 'react';
import { PageList } from './modules/PageEdit';
import { Page } from './modules/PageEdit/types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const TEST_USER_ID = '5fe866e2-5ced-43fb-b18d-7e169ef61d18'; // 测试用的固定 user_id
  const TEST_FILE_ID = '5fe866e2-5ced-43fb-b18d-7e169ef61d18'; // 测试用的固定 file_id

  const handlePageSelect = (page: Page) => {
    setCurrentPage(page);
  };

  const handleCreatePage = () => {
    console.log('创建新页面');
  };

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