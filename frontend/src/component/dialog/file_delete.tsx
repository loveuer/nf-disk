import { Button, Dialog, DialogActions, DialogBody, DialogSurface, DialogTitle, DialogTrigger } from "@fluentui/react-components";
import { Dial } from "../../api";
import { useStoreBucket } from "../../store/bucket";
import { useStoreConnection } from "../../store/connection";
import { useStoreFile, useStoreFileFilter } from "../../store/file";
import { useToast } from "../../message";

export interface FileDeleteDialogProps {
    open: boolean
    set: (v: boolean) => void;
}

export function FileDeleteDialog(props: FileDeleteDialogProps): JSX.Element {
    const { conn_active } = useStoreConnection();
    const { bucket_active } = useStoreBucket();
    const { file_active, files_get} = useStoreFile();
    const { prefix, filter } = useStoreFileFilter();
    const { dispatchMessage } = useToast();

    async function handleDeleteFile() {
        const res = await Dial('/api/file/delete', {
            conn_id: conn_active?.id,
            bucket: bucket_active?.name,
            keys: [file_active],
        })

        if (res.status === 200) {
            await files_get(conn_active!, bucket_active!, prefix, filter)
            dispatchMessage('删除成功', 'success')
        }

        props.set(false)
    }

    return (
        <Dialog open={props.open} onOpenChange={(event, data) => props.set(data.open)}>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>确定删除 {file_active ?? ''} 吗?</DialogTitle>
                    <DialogActions>
                        <DialogTrigger disableButtonEnhancement>
                            <Button
                                onClick={_ => props.set(false)}
                                appearance="secondary">取消</Button>
                        </DialogTrigger>
                        <Button
                            onClick={async () => {
                                await handleDeleteFile()
                            }}
                            appearance="primary">删除</Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    )
}


