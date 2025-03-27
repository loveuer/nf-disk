import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, makeStyles } from "@fluentui/react-components";
import { FileInfo } from "../../interfaces/file_info";
import { HumanSize } from "../../util/human";

const styles = makeStyles({
    container: {
        width: '100%',
    },
    body: {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '8px',
        overflowWrap: 'break-word'  // 添加这一行
    },
    title: {
        fontWeight: 'bold',
        minWidth: '70px',
    },
    value: {  // 添加这个新样式
        wordBreak: 'break-word',
        maxWidth: '100%'
    }
})

export interface FileDetailDialogProps {
    detail: FileInfo | null;
    set_detail: (detail: FileInfo | null) => void;
}

export function FileDetailDialog(props: FileDetailDialogProps): JSX.Element {
    const classes = styles();
    return (
        <Dialog open={props.detail !== null} onOpenChange={(event, data) => props.set_detail(null)}>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>文件详情</DialogTitle>
                    <DialogContent>
                        {props.detail && (
                            <div className={classes.body}>
                                <div className={classes.title}>存储桶:</div>
                                <div>{props.detail.bucket}</div>
                                
                                <div className={classes.title}>文件路径:</div>
                                <div className={classes.value}>{props.detail.key}</div>
                                
                                <div className={classes.title}>文件类型:</div>
                                <div>{props.detail.content_type}</div>
                                
                                <div className={classes.title}>文件大小:</div>
                                <div>{HumanSize(props.detail.size)}</div>
                                
                                <div className={classes.title}>过期时间:</div>
                                <div>
                                    {props.detail.expire >= 0 
                                        ? new Date(props.detail.expire).toLocaleString() 
                                        : '∞'}
                                </div>

                                <div className={classes.title}>最近编辑:</div>
                                <div>
                                    {new Date(props.detail.last_modified).toLocaleString()}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <DialogTrigger disableButtonEnhancement>
                            <Button appearance="secondary" onClick={() => props.set_detail(null)}>关闭</Button>
                        </DialogTrigger>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}