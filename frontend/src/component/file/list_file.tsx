import {
    Button,
    Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger,
    makeStyles,
    MenuItem,
    MenuList, Popover, PopoverSurface, PopoverTrigger,
    Spinner,
    Text,
    tokens,
} from "@fluentui/react-components";
import {
    ArrowDownloadFilled,
    DeleteRegular,
    DocumentBulletListRegular,
    DocumentChevronDoubleRegular,
    DocumentCssRegular,
    DocumentDatabaseRegular,
    DocumentDismissRegular,
    DocumentImageRegular,
    DocumentJavascriptRegular,
    DocumentPdfRegular,
    DocumentYmlRegular,
    FolderRegular,
    PreviewLinkRegular,
} from "@fluentui/react-icons";
import {VirtualizerScrollView} from "@fluentui/react-components/unstable";
import React, {useEffect, useState} from "react";
import {useStoreBucket} from "../../store/bucket";
import {S3File} from "../../interfaces/connection";
import {useStoreFile, useStoreFileFilter} from "../../store/file";
import {useStoreConnection} from "../../store/connection";
import {TrimSuffix} from "../../hook/strings";
import {Dial} from "../../api";
import {useToast} from "../../message";
import {CanPreview} from "../../hook/preview";

const useStyles = makeStyles({
    container: {
        marginTop: "0.5rem",
        maxWidth: "calc(100vw - 25.2rem)",
        width: "calc(100vw - 25.2rem)",
        maxHeight: "calc(100vh - 10rem)",
        height: "calc(100vh - 10rem)",
    },
    loading: {
        flex: "1",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
    },
    no_data: {
        flex: "1",
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "8rem",
        flexDirection: "column",
    },
    list: {
        flex: "1",
        height: "100%",
        width: "100%",
    },
    row: {
        height: "32px",
        lineHeight: "32px",
        display: "flex",
        marginLeft: "0.5rem",
        marginRight: "0.5rem",
    },
    item: {
        width: "100%",
        maxWidth: "100%",
        "&:hover": {
            color: tokens.colorNeutralForeground2BrandPressed,
        },
    },
    text: {
        overflow: "hidden",
        width: "calc(100vw - 32rem)",
        display: "block",
    },
    ctx_menu: {
        position: "absolute",
        zIndex: "1000",
        width: "15rem",
        backgroundColor: tokens.colorNeutralBackground1,
        boxShadow: `${tokens.shadow16}`,
        paddingTop: "4px",
        paddingBottom: "4px",
    },
    ctx_menu_delete: {},
    ctx_menu_delete_confirm: {
        padding: '0.5rem',
    },
});

export interface ListFileComponentProps {
    set_preview_fn: React.Dispatch<
        React.SetStateAction<{ url: string; content_type: string }>
    >;
}

export function ListFileComponent(props: ListFileComponentProps) {
    const styles = useStyles();
    const {dispatchMessage} = useToast();
    const {conn_active} = useStoreConnection();
    const {bucket_active} = useStoreBucket();
    const [open_delete_confirm, set_open_delete_confirm] = useState(false);
    const {file_active, files_get, file_set, files_list} = useStoreFile();
    const {prefix, filter, prefix_set} = useStoreFileFilter();
    const [preview_content_type, set_preview_content_type] = useState("");
    const [ctx_menu, set_ctx_menu] = useState<{
        x: number;
        y: number;
        display: "none" | "block";
    }>({x: 0, y: 0, display: "none"});
    const [loading, set_loading] = useState(true);

    useEffect(() => {
        document.addEventListener("click", (e) => {
            set_ctx_menu({x: 0, y: 0, display: "none"});
        });
        return () => {
            document.removeEventListener("click", (e) => {
            });
        };
    }, []);

    useEffect(() => {
        set_loading(true);
        files_get(conn_active!, bucket_active!, prefix, filter).then(() => {
            set_loading(false);
        });
    }, [conn_active, bucket_active, prefix, filter]);

    const filename = (key: string) => {
        let strs = TrimSuffix(key, "/").split("/");
        return strs[strs.length - 1];
    };

    async function handleClick(item: S3File) {
        if (item.type === 1) {
            await prefix_set(item.key);
            return;
        }
    }

    async function handleRightClick(
        e: React.MouseEvent<HTMLDivElement>,
        item: S3File
    ) {
        e.preventDefault();
        await file_set(item.key);
        set_preview_content_type(CanPreview(item.name));
        const ele = document.querySelector("#list-file-container");
        let eleX = ele ? ele.clientWidth : 0;
        let eleY = ele ? ele.clientHeight : 0;
        const positionX =
            e.pageX + eleX > window.innerWidth ? e.pageX - eleX : e.pageX;
        const positionY =
            e.pageY + eleY > window.innerHeight ? e.pageY - eleY : e.pageY;
        set_ctx_menu({
            x: positionX,
            y: positionY,
            display: "block",
        });
    }

    async function handleDownload(file: string | null) {
        if (!file) return;
        const res1 = await Dial<{ result: string }>("/runtime/dialog/save", {
            default_filename: file,
        });
        if (res1.status !== 200) {
            return;
        }
        if (!res1.data) return;
        const res2 = await Dial("/api/file/download", {
            conn_id: conn_active?.id,
            bucket: bucket_active?.name,
            key: file,
            location: res1.data.result,
        });
        if (res2.status === 200) {
            dispatchMessage("保存文件成功", "success");
        }
    }

    async function handlePreview() {
        const res = await Dial<{ url: string; method: string }>("/api/file/get", {
            conn_id: conn_active?.id,
            bucket: bucket_active?.name,
            key: file_active ?? "",
        });
        if (res.status !== 200) {
            dispatchMessage("预览失败", "warning");
            return;
        }
        props.set_preview_fn({
            url: res.data.url,
            content_type: preview_content_type,
        });
    }

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
        set_open_delete_confirm(false)
    }

    return (
        <div className={styles.container}>
            <div className={'dialog_delete_confirm'}>
                <Dialog open={open_delete_confirm}>
                    <DialogSurface>
                        <DialogBody>
                            <DialogTitle>确定删除 {file_active ?? ''} 吗?</DialogTitle>
                            <DialogActions>
                                <DialogTrigger disableButtonEnhancement>
                                    <Button
                                        onClick={_ => set_open_delete_confirm(false)}
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
            </div>
            <div
                id={"list-file-container"}
                className={styles.ctx_menu}
                style={{left: ctx_menu.x, top: ctx_menu.y, display: ctx_menu.display}}
            >
                <MenuList>
                    <MenuItem
                        onClick={async () => {
                            await handleDownload(file_active);
                        }}
                    >
                        <Button
                            icon={<ArrowDownloadFilled/>}
                            iconPosition={'before'}
                            appearance={'transparent'}>
                            下载
                        </Button>
                    </MenuItem>
                    <MenuItem
                        disabled={!preview_content_type}
                        onClick={async () => {
                            await handlePreview();
                        }}
                    >
                        <Button
                            icon={<PreviewLinkRegular/>}
                            iconPosition={'before'}
                            disabled={!preview_content_type}
                            appearance={'transparent'}>
                            预览
                        </Button>
                    </MenuItem>
                    <MenuItem
                        id={"ctx-menu-delete"}
                        className={styles.ctx_menu_delete}
                    >
                        <Button
                            icon={<DeleteRegular/>}
                            iconPosition={'before'}
                            onClick={_ => set_open_delete_confirm(true)}
                            appearance={'transparent'}>
                            删除
                        </Button>
                    </MenuItem>

                </MenuList>
            </div>
            <div
                className={styles.loading}
                style={{display: loading ? "flex" : "none"}}
            >
                <Spinner appearance="primary" label="加载中..."/>
            </div>
            <div
                className={styles.no_data}
                style={{display: !loading && !files_list.length ? "flex" : "none"}}
            >
                <div>
                    <DocumentDismissRegular/>
                </div>
                <Text size={900}>没有文件</Text>
            </div>
            <div
                style={{display: !loading && files_list.length ? "block" : "none"}}
            >
                <VirtualizerScrollView
                    numItems={files_list.length}
                    itemSize={32}
                    container={{
                        role: "list",
                        style: {maxHeight: "calc(100vh - 10rem)"},
                    }}
                >
                    {(idx) => {
                        return (
                            <div
                                className={styles.row}
                                key={idx}
                                onClick={async () => {
                                    await handleClick(files_list[idx]);
                                }}
                                onContextMenu={async (e) => {
                                    await handleRightClick(e, files_list[idx]);
                                }}
                            >
                                <MenuItem
                                    className={styles.item}
                                    icon={
                                        files_list[idx].type ? (
                                            <FolderRegular/>
                                        ) : (
                                            <FileIcon name={files_list[idx].name}/>
                                        )
                                    }
                                >
                                    <Text truncate wrap={false} className={styles.text}>
                                        {filename(files_list[idx].key)}
                                    </Text>
                                </MenuItem>
                            </div>
                        );
                    }}
                </VirtualizerScrollView>
            </div>
        </div>
    )
        ;
}

type FileIconProps = {
    name: string;
};

function FileIcon(props: FileIconProps) {
    const strings = props.name.split(".");
    const suffix = strings[strings.length - 1];
    switch (suffix.toLowerCase()) {
        case "png":
            return <DocumentImageRegular/>;
        case "jpg":
            return <DocumentImageRegular/>;
        case "jpeg":
            return <DocumentImageRegular/>;
        case "gif":
            return <DocumentImageRegular/>;
        case "db":
            return <DocumentDatabaseRegular/>;
        case "sqlite":
            return <DocumentDatabaseRegular/>;
        case "sqlite3":
            return <DocumentDatabaseRegular/>;
        case "pdf":
            return <DocumentPdfRegular/>;
        case "css":
            return <DocumentCssRegular/>;
        case "js":
            return <DocumentJavascriptRegular/>;
        case "yaml":
            return <DocumentYmlRegular/>;
        case "yml":
            return <DocumentYmlRegular/>;
        case "html":
            return <DocumentChevronDoubleRegular/>;
        case "json":
            return <DocumentChevronDoubleRegular/>;
        case "go":
            return <DocumentChevronDoubleRegular/>;
        default:
            return <DocumentBulletListRegular/>;
    }
}
