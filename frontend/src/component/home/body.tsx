import {makeStyles} from "@fluentui/react-components";
import {ConnectionList} from "../connection/list";
import {Content} from "../file/content";

const useStyles = makeStyles({
    body: {
        display: "flex",
        flexDirection: 'row',
        width: "100%",
        flex: '1',
    },
})

export function Body() {
    const styles = useStyles();

    return <div className={styles.body}>
        <ConnectionList/>
        <Content/>
    </div>
}