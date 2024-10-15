import {create} from 'zustand'
import {Bucket, Connection} from "../interfaces/connection";
import {Dial, Resp} from "../api";

interface StoreBucket {
    bucket_active: Bucket | null;
    bucket_set: (Bucket: Bucket | null) => Promise<void>;
    bucket_list: Bucket[];
    bucket_get: (conn: Connection, refresh: boolean) => void;
    bucket_create: (conn: Connection, name: string, public_read: boolean, public_read_write: boolean) => void;
}

let bucket_map: { [id: number]: Bucket[] };

export const useStoreBucket = create<StoreBucket>()((set) => ({
    bucket_active: null,
    bucket_set: async (bucket: Bucket | null) => {
        set({bucket_active: bucket});
    },
    bucket_list: [],
    bucket_get: async (conn: Connection, refresh: boolean) => {
        let res: Resp<{ list: Bucket[]; }>;
        if (refresh) {
            res = await Dial<{ list: Bucket[] }>('/api/connection/buckets', {id: conn.id});
            if (res.status !== 200) {
                return
            }
        }

        set((state) => {
            if (refresh) {
                bucket_map = {...bucket_map, [conn.id]: res.data.list}
                return {bucket_list: res.data.list};
            }

            return {bucket_list: bucket_map[conn.id]};
        })
    },
    bucket_create: async (conn: Connection, name: string, public_read: boolean) => {
        const res = await Dial<{ bucket: string }>('/api/bucket/create', {
            conn_id: conn.id,
            name: name,
            public_read: public_read,
            public_read_write: public_read,
        })

        if (res.status !== 200) {
            return
        }

        set((state) => {
            return {bucket_list: [...state.bucket_list, {name: res.data.bucket, created_at: 0}]}
        })
    }
}))
