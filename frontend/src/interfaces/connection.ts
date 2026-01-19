export interface Connection {
    id: number;
    created_at: number;
    updated_at: number;
    deleted_at: number;
    name: string;
    endpoint: string;
    active: boolean;
    // 编辑时需要的敏感字段，可选
    access?: string;
    key?: string;
}

export interface Bucket {
    name: string;
    created_at: number;
}

export interface S3File {
    name: string;
    key: string;
    last_modified: number;
    size: number;
    type: 0 | 1;
}