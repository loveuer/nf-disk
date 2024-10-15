import {Invoke} from "../wailsjs/go/controller/App";

export interface Resp<T> {
    status: number;
    msg: string;
    err: string;
    data: T;
}


// 类型保护函数
function isResp<T>(obj: any): obj is Resp<T> {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.status === 'number' &&
        (typeof obj.msg === 'string' || typeof obj.msg === null) &&
        (typeof obj.err === 'string' || typeof obj.err === null)
    );
}

export async function Dial<T=any>(path: string, req: any = null): Promise<Resp<T>> {
    const bs = JSON.stringify(req)
    console.log(`[DEBUG] invoke req: path = ${path}, req =`, req)

    let result: Resp<T>;
    let ok = false;

    try {
        const res = await Invoke(path, bs)
        const parsed = JSON.parse(res);
        if (isResp<T>(parsed)) {
            result = parsed;
            ok = true
        } else {
            console.error('[ERROR] invoke: resp not valid =', res)
            result = {status: 500, msg: "发生错误(0)", err: res} as Resp<T>;
        }
    } catch (error) {
        result = {status: 500, msg: "发生错误(-1)", err: "backend method(Invoke) not found in window"} as Resp<T>;
    }

    if (ok) {
        console.log(`[DEBUG] invoke res: path = ${path}, res =`, result)
    } else {
        console.error(`[ERROR] invoke res: path = ${path}, res =`, result)
    }

    return result
}
