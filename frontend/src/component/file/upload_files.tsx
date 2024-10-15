import {
    DialogTrigger,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
    Button, Field, Input, makeStyles, tokens, Tooltip,
} from "@fluentui/react-components";
import {useState} from "react";
import {useToast} from "../../message";
import {Dial} from "../../api";
import {useStoreConnection} from "../../store/connection";
import {useStoreBucket} from "../../store/bucket";
import {useStoreFile, useStoreFileFilter} from "../../store/file";
import {MoreHorizontalRegular} from "@fluentui/react-icons";

const useStyle = makeStyles({
    container: {
        backgroundColor: tokens.colorNeutralBackground1,
        display: "flex",
        flexDirection: "row",
        height: "100%",
        width: "100%",
        gridColumnStart: 0,
    },
    input: {
        cursor: "pointer",
        display: 'flex',
    },
    select: {
        minWidth: 'unset',
    },
});

export interface UploadFilesProps {
    openFn: (open: boolean) => void;
}

export function UploadFiles(props: UploadFilesProps) {
    const styles = useStyle();
    const {dispatchMessage} = useToast();

    const { conn_active} = useStoreConnection();
    const {bucket_active} = useStoreBucket();
    const {files_get} = useStoreFile()
    const {prefix } = useStoreFileFilter()

    const [selected, set_selected] = useState<string[]>([]);

    async function handleSelect() {
        const res = await Dial<{ result: string[] }>('/runtime/dialog/open', {
            title: '选择文件',
            type: 'multi'
        })

        if (res.status !== 200) {
            return
        }

        set_selected(res.data.result)
    }

    async function create() {
        let ok = true
        for (const item of selected) {
            const res = await Dial('/api/file/upload', {
                conn_id: conn_active?.id,
                bucket: bucket_active?.name,
                location: item,
                detect_content_type: true,
            })

            if (res.status !== 200) {
                dispatchMessage(`上传文件: ${item} 失败`, "error")
                ok = false
                return
            }
        }

        if(ok) {
            files_get(conn_active!, bucket_active!, prefix)
            dispatchMessage('上传成功!', 'success')
            props.openFn(false)
            return
        }
    }

    return <>
        <DialogSurface>
            <DialogBody>
                <DialogTitle>上传文件到 {`${bucket_active?.name} / ${prefix}`}</DialogTitle>
                <DialogContent>
                    <Field label="选择文件" required>
                        <Input
                            className={styles.input}
                            value={selected?.join('; ')}
                            contentAfter={
                                <Tooltip content={'点击选择文件'} relationship={'description'}>
                                    <Button
                                        className={styles.select}
                                        onClick={async () => {
                                            await handleSelect()
                                        }}
                                        size={'small'}
                                        appearance={'transparent'}>
                                        <MoreHorizontalRegular/>
                                    </Button>
                                </Tooltip>
                            }/>
                    </Field>
                </DialogContent>
                <DialogActions className={styles.container}>
                    <DialogTrigger disableButtonEnhancement>
                        <Button appearance="secondary">取消</Button>
                    </DialogTrigger>
                    <Button onClick={async () => {
                        await create()
                    }} appearance="primary">上传</Button>
                </DialogActions>
            </DialogBody>
        </DialogSurface>
    </>
}
