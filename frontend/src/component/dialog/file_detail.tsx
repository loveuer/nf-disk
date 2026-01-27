import React from "react";
import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, makeStyles } from "@fluentui/react-components";
import { FileInfo } from "../../interfaces/file_info";
import { HumanSize } from "../../util/human";
import { useToast } from "../../message";

const styles = makeStyles({
    container: {
        width: '100%',
    },
    body: {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '8px',
        overflowWrap: 'break-word'
    },
    title: {
        fontWeight: 'bold',
        minWidth: '120px',
    },
    value: {
        wordBreak: 'break-word',
        maxWidth: '100%',
        fontFamily: 'monospace',
    },
    section: {
        marginBottom: '16px',
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: '14px',
        marginBottom: '8px',
        color: '#605e5c',
    },
    metadataContainer: {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '4px',
        fontSize: '12px',
        maxHeight: '150px',
        overflowY: 'auto',
        border: '1px solid #d2d0ce',
        borderRadius: '4px',
        padding: '8px',
    },
    copyButton: {
        marginLeft: '8px',
        fontSize: '12px',
    }
})

export interface FileDetailDialogProps {
    detail: FileInfo | null;
    set_detail: (detail: FileInfo | null) => void;
}

export function FileDetailDialog(props: FileDetailDialogProps): JSX.Element {
    const classes = styles();
    const { dispatchMessage } = useToast();

    // 复制到剪贴板功能
    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text).then(() => {
            dispatchMessage("已复制到剪贴板", "success");
        }).catch(() => {
            dispatchMessage("复制失败", "error");
        });
    }

    // 格式化时间
    function formatDate(timestamp?: number): string {
        if (!timestamp || timestamp <= 0) return '∞';
        return new Date(timestamp).toLocaleString();
    }

    // 渲染带复制按钮的值
    function renderValueWithCopy(value: string, showCopy: boolean = true) {
        if (!value) return '-';
        
        return (
            <div className={classes.value}>
                <code style={{ fontSize: '12px' }}>{value}</code>
                {showCopy && (
                    <Button 
                        size="small" 
                        appearance="subtle"
                        className={classes.copyButton}
                        onClick={() => copyToClipboard(value)}
                    >
                        复制
                    </Button>
                )}
            </div>
        );
    }

    return (
        <Dialog open={props.detail !== null} onOpenChange={(event, data) => props.set_detail(null)}>
            <DialogSurface style={{ maxWidth: '800px', width: '90vw' }}>
                <DialogBody>
                    <DialogTitle>文件详情</DialogTitle>
                    <DialogContent>
                        {props.detail && (
                            <div>
                                {/* 基础信息 */}
                                <div className={classes.section}>
                                    <div className={classes.sectionTitle}>📁 基础信息</div>
                                    <div className={classes.body}>
                                        <div className={classes.title}>存储桶:</div>
                                        <div>{props.detail.bucket}</div>
                                        
                                        <div className={classes.title}>文件路径:</div>
                                        <div className={classes.value}>{props.detail.key}</div>
                                        
                                        <div className={classes.title}>文件大小:</div>
                                        <div>{HumanSize(props.detail.size)}</div>
                                        
                                        <div className={classes.title}>文件类型:</div>
                                        <div>{props.detail.content_type || '-'}</div>
                                        
                                        <div className={classes.title}>最近编辑:</div>
                                        <div>{formatDate(props.detail.last_modified)}</div>
                                        
                                        <div className={classes.title}>ETag:</div>
                                        {renderValueWithCopy(props.detail.etag)}
                                    </div>
                                </div>

                                {/* HTTP Header 信息 */}
                                <div className={classes.section}>
                                    <div className={classes.sectionTitle}>🌐 HTTP Header</div>
                                    <div className={classes.body}>
                                        {props.detail.cache_control && (
                                            <>
                                                <div className={classes.title}>Cache-Control:</div>
                                                <div className={classes.value}>{props.detail.cache_control}</div>
                                            </>
                                        )}
                                        {props.detail.content_encoding && (
                                            <>
                                                <div className={classes.title}>Content-Encoding:</div>
                                                <div className={classes.value}>{props.detail.content_encoding}</div>
                                            </>
                                        )}
                                        {props.detail.content_disposition && (
                                            <>
                                                <div className={classes.title}>Content-Disposition:</div>
                                                <div className={classes.value}>{props.detail.content_disposition}</div>
                                            </>
                                        )}
                                        {props.detail.content_language && (
                                            <>
                                                <div className={classes.title}>Content-Language:</div>
                                                <div className={classes.value}>{props.detail.content_language}</div>
                                            </>
                                        )}
                                        {props.detail.accept_ranges && (
                                            <>
                                                <div className={classes.title}>Accept-Ranges:</div>
                                                <div className={classes.value}>{props.detail.accept_ranges}</div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* 存储信息 */}
                                <div className={classes.section}>
                                    <div className={classes.sectionTitle}>💾 存储信息</div>
                                    <div className={classes.body}>
                                        <div className={classes.title}>存储类别:</div>
                                        <div>{props.detail.storage_class || 'STANDARD'}</div>
                                        
                                        {props.detail.version_id && (
                                            <>
                                                <div className={classes.title}>版本ID:</div>
                                                {renderValueWithCopy(props.detail.version_id)}
                                            </>
                                        )}
                                        
                                        <div className={classes.title}>删除标记:</div>
                                        <div>{props.detail.delete_marker ? '是' : '否'}</div>
                                        
                                        {props.detail.parts_count && props.detail.parts_count > 1 && (
                                            <>
                                                <div className={classes.title}>分片数量:</div>
                                                <div>{props.detail.parts_count}</div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* 安全信息 */}
                                <div className={classes.section}>
                                    <div className={classes.sectionTitle}>🔒 安全信息</div>
                                    <div className={classes.body}>
                                        {props.detail.server_side_encryption && (
                                            <>
                                                <div className={classes.title}>加密方式:</div>
                                                <div>{props.detail.server_side_encryption}</div>
                                            </>
                                        )}
                                        {props.detail.sse_kms_key_id && (
                                            <>
                                                <div className={classes.title}>KMS密钥ID:</div>
                                                {renderValueWithCopy(props.detail.sse_kms_key_id)}
                                            </>
                                        )}
                                        {typeof props.detail.bucket_key_enabled === 'boolean' && (
                                            <>
                                                <div className={classes.title}>存储桶密钥:</div>
                                                <div>{props.detail.bucket_key_enabled ? '启用' : '禁用'}</div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* 自定义元数据 */}
                                {props.detail.metadata && Object.keys(props.detail.metadata).length > 0 && (
                                    <div className={classes.section}>
                                        <div className={classes.sectionTitle}>🏷️ 自定义元数据</div>
                                        <div className={classes.metadataContainer}>
                                            {Object.entries(props.detail.metadata).map(([key, value]) => (
                                                <React.Fragment key={key}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{key}:</div>
                                                    <div style={{ wordBreak: 'break-all', fontSize: '12px' }}>{value}</div>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 校验和信息 */}
                                {(props.detail.checksum_crc32 || props.detail.checksum_sha256) && (
                                    <div className={classes.section}>
                                        <div className={classes.sectionTitle}>✅ 校验和</div>
                                        <div className={classes.body}>
                                            {props.detail.checksum_crc32 && (
                                                <>
                                                    <div className={classes.title}>CRC32:</div>
                                                    {renderValueWithCopy(props.detail.checksum_crc32)}
                                                </>
                                            )}
                                            {props.detail.checksum_crc32c && (
                                                <>
                                                    <div className={classes.title}>CRC32C:</div>
                                                    {renderValueWithCopy(props.detail.checksum_crc32c)}
                                                </>
                                            )}
                                            {props.detail.checksum_sha1 && (
                                                <>
                                                    <div className={classes.title}>SHA1:</div>
                                                    {renderValueWithCopy(props.detail.checksum_sha1)}
                                                </>
                                            )}
                                            {props.detail.checksum_sha256 && (
                                                <>
                                                    <div className={classes.title}>SHA256:</div>
                                                    {renderValueWithCopy(props.detail.checksum_sha256)}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Object Lock 信息 */}
                                {(props.detail.object_lock_mode || props.detail.object_lock_legal_hold_status) && (
                                    <div className={classes.section}>
                                        <div className={classes.sectionTitle}>🔒 Object Lock</div>
                                        <div className={classes.body}>
                                            {props.detail.object_lock_mode && (
                                                <>
                                                    <div className={classes.title}>锁定模式:</div>
                                                    <div>{props.detail.object_lock_mode}</div>
                                                </>
                                            )}
                                            {props.detail.object_lock_legal_hold_status && (
                                                <>
                                                    <div className={classes.title}>法律锁定状态:</div>
                                                    <div>{props.detail.object_lock_legal_hold_status}</div>
                                                </>
                                            )}
                                            {props.detail.object_lock_retain_until_date && props.detail.object_lock_retain_until_date > 0 && (
                                                <>
                                                    <div className={classes.title}>保留至:</div>
                                                    <div>{formatDate(props.detail.object_lock_retain_until_date)}</div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
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