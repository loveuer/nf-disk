import {Header} from "./header";
import {Body} from "./body";
import {makeStyles} from "@fluentui/react-components";
import {Footer} from "./footer";

const useStyles = makeStyles({
    container: {
        height: '100vh',  // 使用视口高度
        width: '100vw',   // 使用视口宽度
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // 禁止滚动
    },
})

export function Home() {
    const styles = useStyles()
    return (
        <div className={styles.container}>
            <Header />
            <Body />
            <Footer/>
        </div>
    )
}