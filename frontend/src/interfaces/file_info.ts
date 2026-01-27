export interface FileInfo {
    // 基础信息
    bucket: string;
    key: string;
    content_type: string;
    size: number;
    expire: number;
    last_modified: number;
    
    // Header 信息
    etag: string;
    cache_control?: string;
    content_encoding?: string;
    content_disposition?: string;
    content_language?: string;
    accept_ranges?: string;
    
    // 存储信息
    storage_class?: string;
    version_id?: string;
    
    // 加密信息
    server_side_encryption?: string;
    sse_kms_key_id?: string;
    bucket_key_enabled?: boolean;
    
    // 自定义元数据
    metadata?: Record<string, string>;
    missing_meta?: number;
    
    // 校验和
    checksum_crc32?: string;
    checksum_crc32c?: string;
    checksum_sha1?: string;
    checksum_sha256?: string;
    
    // 其他信息
    delete_marker?: boolean;
    parts_count?: number;
    website_redirect_location?: string;
    
    // 归档信息
    archive_status?: string;
    restore?: string;
    
    // Object Lock 信息
    object_lock_legal_hold_status?: string;
    object_lock_mode?: string;
    object_lock_retain_until_date?: number;
    
    // 复制信息
    replication_status?: string;
}