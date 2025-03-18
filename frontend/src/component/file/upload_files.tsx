import {
    DialogTrigger,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
    Button, Field, Input, makeStyles, tokens, Tooltip,
    Checkbox,
} from "@fluentui/react-components";
import {ChangeEvent, useState} from "react";
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
        marginTop: '10px',
    },
    input: {
        cursor: "pointer",
        display: 'flex',
    },
    select: {
        minWidth: 'unset',
    },
    custom_key: {
        marginTop: '10px',

    },
    custom_key_check: {
        marginLeft: '-5px',
    }
});

export interface UploadFilesProps {
    openFn: (open: boolean) => void;
}

export function UploadFiles(props: UploadFilesProps) {
    const styles = useStyle();
    const {dispatchMessage} = useToast();

    const {conn_active} = useStoreConnection();
    const {bucket_active} = useStoreBucket();
    const {files_get} = useStoreFile()
    const {prefix} = useStoreFileFilter()

    const [selected, set_selected] = useState<string[]>([]);
    const [checked, set_check] = useState(false);
    const [custom_key, set_custom_key] = useState('');

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
                name: (checked && custom_key) ? custom_key : '',
            })

            if (res.status !== 200) {
                dispatchMessage(`上传文件: ${item} 失败`, "error")
                ok = false
                return
            }
        }

        if (ok) {
            files_get(conn_active!, bucket_active!, prefix)
            dispatchMessage('上传成功!', 'success')
            props.openFn(false)
            return
        }
    }

    function handleCheck(e: ChangeEvent<HTMLInputElement>) {
        set_check(e.target.checked)
    }

    function handleCustomKey(e:ChangeEvent<HTMLInputElement>) {
       set_custom_key(e.target.value)
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
                    <Field className={styles.custom_key}>
                        <Checkbox onChange={e => handleCheck(e)} className={styles.custom_key_check}
                                  label="自定义 key"/>
                        <Input
                            style={{visibility: checked ? 'visible' : 'hidden'}}
                            className={styles.input}
                            onChange={e => handleCustomKey(e)}
                            value={custom_key}/>
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
