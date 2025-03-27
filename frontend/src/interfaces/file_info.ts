export interface FileInfo {
    bucket: string;
    key: string;
    content_type: string;
    size: number;
    expire: number;
    last_modified: number;
}