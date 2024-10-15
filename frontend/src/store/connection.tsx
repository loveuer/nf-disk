import {create} from 'zustand'
import {Connection} from "../interfaces/connection";
import {Dial} from "../api";

interface StoreConnection {
    conn_active: Connection | null;
    conn_list: Connection[];
    conn_get: () => Promise<void>;
    conn_set: (connection: Connection) => Promise<void>;
}

export const useStoreConnection = create<StoreConnection>()((set) => ({
    conn_active: null,
    conn_list: [],
    conn_get: async () => {
        const res = await Dial<{ list: Connection[] }>('/api/connection/list');
        if (res.status !== 200) {
            return
        }

        set({conn_list: res.data.list})
    },

    conn_set: async (connection: Connection) => {
        set((state) => {
            return {
                conn_active: connection.active? connection: null,
                conn_list: state.conn_list.map(item => {
                    if (item.id === connection.id) {
                        return connection
                    }

                    return item
                })
            }
        })
    }
}))
