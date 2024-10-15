import {Header} from "./header";
import {Body} from "./body";
import {makeStyles} from "@fluentui/react-components";
import {Footer} from "./footer";

const useStyles = makeStyles({
    container: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
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