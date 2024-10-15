import {Button, Dialog, DialogTrigger, makeStyles} from "@fluentui/react-components";
import {ConnectionCreate} from "../connection/new";
import {AppsAddInRegular, DocumentArrowUpRegular, PlugConnectedAddRegular} from "@fluentui/react-icons";
import {useState} from "react";
import {useStoreConnection} from "../../store/connection";
import {BucketCreate} from "../bucket/new";
import {useStoreBucket} from "../../store/bucket";
import {UploadFiles} from "../file/upload_files";

const useStyles = makeStyles({
    header: {
        height: "5rem",
        minHeight: '5rem',
        width: "100%",
        display: 'flex',
        alignItems: "center",
        borderBottom: "1px solid lightgray",
    },
    button_new: {
        margin: '0.5rem',
    },
})

export function Header() {
    const styles = useStyles();
    const {conn_active} = useStoreConnection()
    const {bucket_active} = useStoreBucket()
    const [open_create_conn, set_open_create_conn] = useState(false);
    const [open_create_bucket, set_open_create_bucket] = useState(false);
    const [open_upload, set_open_upload] = useState(false);

    return <div className={styles.header}>
        <div className={styles.button_new}>
            <Dialog
                open={open_create_conn}
                onOpenChange={(event, data) => set_open_create_conn(data.open)}>
                <DialogTrigger disableButtonEnhancement>
                    <Button appearance="primary" icon={<PlugConnectedAddRegular/>}>
                        新建连接
                    </Button>
                </DialogTrigger>
                <ConnectionCreate openFn={set_open_create_conn}/>
            </Dialog>
        </div>

        {conn_active &&
            <div className={styles.button_new}>
                <Dialog
                    open={open_create_bucket}
                    onOpenChange={(event, data) => set_open_create_bucket(data.open)}>
                    <DialogTrigger disableButtonEnhancement>
                        <Button appearance="primary" icon={<AppsAddInRegular/>}>
                            新建桶
                        </Button>
                    </DialogTrigger>
                    <BucketCreate openFn={set_open_create_bucket}/>
                </Dialog>
            </div>
        }

        {
            bucket_active &&
            <div className={styles.button_new}>
                <Dialog
                    open={open_upload}
                    onOpenChange={(event, data) => set_open_upload(data.open)}>
                    <DialogTrigger disableButtonEnhancement>
                        <Button appearance="primary" icon={<DocumentArrowUpRegular/>}>
                            上传
                        </Button>
                    </DialogTrigger>
                    <UploadFiles openFn={set_open_upload}/>
                </Dialog>
            </div>
        }
    </div>
}