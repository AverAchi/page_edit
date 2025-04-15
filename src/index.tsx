import React from 'react';
import { createRoot } from 'react-dom/client';
import { PageEdit, Page } from './modules/PageEdit';
import './index.css';

// 示例页面数据
const samplePage: Page = {
    id: 'page1',
    title: 'Sample Page',
    description: 'A demo page for Page Editor',
    parts: [
        {
            id: 'part1',
            part_type: 'text' as const,
            part_content: 'This is a text part.',
            part_index: 1,
        },
        {
            id: 'part2',
            part_type: 'code' as const,
            part_content: 'console.log("Hello, World!");',
            part_index: 2,
            metadata: { language: 'javascript' },
        },
        {
            id: 'part3',
            part_type: 'pdf' as const,
            part_content: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            part_index: 3,
            metadata: { fileName: 'dummy.pdf' },
        },
    ],
};

// 保存回调
const handleSave = (updatedPage: any) => {
    console.log('Saving page:', updatedPage);
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <PageEdit 
            page={samplePage} 
            onSave={handleSave} 
            onClose={() => console.log('Editor closed')} 
        />
    </React.StrictMode>
);