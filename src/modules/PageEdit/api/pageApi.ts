import axios from 'axios';

const API_BASE_URL = 'http://localhost:20250'; // 请根据实际后端地址修改

export interface CreatePagePartDto {
    page_id: string;
    part_index: number;
    part_type: string;
    part_content: string;
    meta_data?: string;
}

export interface CreatePageDto {
    title?: string;
    description?: string;
    index: number;
    file_id?: string;
}

export const pageApi = {
    // 创建新页面
    createPage: async (data: CreatePageDto) => {
        const response = await axios.post(`${API_BASE_URL}/page/create`, data);
        return response.data;
    },

    // 更新页面
    updatePage: async (pageId: string, data: Partial<CreatePageDto>) => {
        const response = await axios.patch(`${API_BASE_URL}/page/update/${pageId}`, data);
        return response.data;
    },

    // 创建页面部分
    createPagePart: async (data: CreatePagePartDto) => {
        const response = await axios.post(`${API_BASE_URL}/page/part/create`, data);
        return response.data;
    },

    // 更新页面部分
    updatePagePart: async (partId: string, data: Partial<CreatePagePartDto>) => {
        const response = await axios.patch(`${API_BASE_URL}/page/part/update/${partId}`, data);
        return response.data;
    },

    // 删除页面部分
    deletePagePart: async (partId: string) => {
        const response = await axios.delete(`${API_BASE_URL}/page/part/delete/${partId}`);
        return response.data;
    },

    // 获取页面详情
    getPage: async (pageId: string) => {
        const response = await axios.get(`${API_BASE_URL}/page/detail/${pageId}`);
        return response.data;
    },

    // 获取页面部分列表
    getPagePartList: async (pageId: string) => {
        const response = await axios.get(`${API_BASE_URL}/page/part/list/${pageId}`);
        return response.data;
    },

    // 获取用户页面列表
    getUserPages: async (userId: string) => {
        const response = await axios.get(`${API_BASE_URL}/page/list/ofUser/${userId}`);
        return response.data;
    }
};  