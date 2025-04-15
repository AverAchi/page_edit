// 定义 Part 类型，适配后端 PagePart 实体
export interface Part {
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

// PageEdit 的 Props，方便父项目传递数据和回调
export interface PageEditProps {
    page: Page;
    onSave: (updatedPage: Page) => void;
    onClose?: () => void;
}

// 文本组件 Props
export interface TextPartProps {
    content: string;
    onChange: (content: string) => void;
}

// 代码组件 Props
export interface CodePartProps {
    content: string;
    language: string;
    onChange: (content: string) => void;
}

// PDF 组件 Props
export interface PdfPartProps {
    url: string;
    fileName?: string;
}

// Part 包装组件 Props
export interface PartWrapperProps {
    part: Part;
    index: number;
    onUpdate: (id: string, updates: Partial<Part>) => void;
    onDelete: (id: string) => void;
}