import {create} from 'zustand'
import {Bucket, Connection, S3File} from "../interfaces/connection";
import {Dial} from "../api";

interface StoreFile {
    file_active: string | null,
    file_set: (key: string) => Promise<void>,
    files_list: S3File[];
    files_get: (conn: Connection, bucket: Bucket, prefix?: string, filter?: string) => Promise<void>;
}

export const useStoreFile = create<StoreFile>()((set) => ({
    file_active: null,
    file_set: async (key: string) => {
        set((state) => {
            return {file_active: key}
        })
    },
    files_list: [],
    files_get: async (conn: Connection, bucket: Bucket, prefix = '', filter = '') => {
        const res = await Dial<{ list: S3File[] }>('/api/bucket/files', {
            conn_id: conn.id,
            bucket: bucket.name,
            prefix: prefix + filter,
        })

        if (res.status !== 200) {
            return
        }

        set((state) => {
            return {files_list: res.data.list}
        })
    },
}))

interface StoreFileFilter {
    prefix: string;
    filter: string;
    prefix_set: (prefix: string) => Promise<void>;
    filter_set: (filter: string) => Promise<void>;
}

export const useStoreFileFilter = create<StoreFileFilter>()((set) => ({
    prefix: '',
    filter: '',
    prefix_set: async (keyword: string) => {
        set(state => {return {prefix: keyword}})
    },
    filter_set: async (keyword: string) => {
        set(state => {return {filter: keyword}})
    },
}))