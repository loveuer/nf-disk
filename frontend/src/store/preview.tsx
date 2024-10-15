import {create} from 'zustand'
import {Dial} from "../api";
import {Bucket, Connection} from "../interfaces/connection";

interface StorePreview {
    preview_url: string;
    preview_content_type: string;
    preview_get: (conn:Connection,bucket: Bucket,key: string) => Promise<void>;
}

export const useStorePreview = create<StorePreview>()((set) => ({
    preview_url: '',
    preview_content_type: '',
    preview_get: async (conn: Connection, bucket: Bucket,key: string) => {
        if (key === '') {
            return set(()=>{return {preview_url: ''}})
        }

        let res = await Dial<{url:string,method:string}>('/api/file/get', {
            conn_id: conn.id,
            bucket: bucket.name,
            key: key
        })

        if(res.status!=200) {
           return set(()=>{return {preview_url: ''}})
        }

        set(()=>{
            return {preview_url:res.data.url}
        })
    },
}))
