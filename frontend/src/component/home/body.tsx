import { makeStyles } from "@fluentui/react-components";
import { ConnectionList } from "../connection/list";
import { Content } from "../file/content";

const useStyles = makeStyles({
    body: {
        display: "flex",
        flexDirection: 'row',
        width: "100%",
        overflow: 'hidden', // 防止内容溢出
        flex: 1, // 允许内容区域填充剩余空间，以适应视口调整
    },
})

export function Body() {
    const styles = useStyles();

    return <div className={styles.body}>
            <ConnectionList />
            <Content />
    </div>
}