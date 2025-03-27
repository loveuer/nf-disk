import { makeStyles } from "@fluentui/react-components";
import { useEffect, useState } from "react";
import { EventsOn } from "../../../wailsjs/runtime/runtime";
import { useStoreFile } from "../../store/file";
import { HumanSize } from "../../util/human";

const useStyles = makeStyles({
    footer: {
        height: "4rem",  // 稍微减小高度
        width: "100%",
        display: 'flex',
        alignItems: "center",
        borderTop: "1px solid lightgray",
    },
    progressText: {
        marginLeft: "1rem",
    },
});

export function Footer() {
    const styles = useStyles();
    const [downloadData, setDownloadData] = useState<{ total: number, copied: number } | null>(null);
    const { file_active } = useStoreFile();

    useEffect(() => {
        EventsOn("download", (data: { total: number, copied: number }) => {
            setDownloadData(data);
            if (data.copied >= data.total) {
                setTimeout(() => {
                    setDownloadData(null);
                }, 3000)
            }
        });

        return () => {

        };
    }, []);

    return (
        <div className={styles.footer}>
            {downloadData && (
                <div className={styles.progressText}>
                    {downloadData.copied >= downloadData.total && <div>{file_active} 下载完成</div>}
                    {downloadData.copied < downloadData.total &&
                        <div>{file_active} 下载中: {HumanSize(downloadData.copied)} / {HumanSize(downloadData.total)}</div>
                    }
                </div>
            )}
        </div>
    );
}