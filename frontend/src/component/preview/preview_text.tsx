import {useEffect, useState} from "react";
import {makeStyles, Textarea, tokens} from "@fluentui/react-components";
import {marked} from "marked";

const useStyles = makeStyles({
    container: {
        height: "100%",
        width: "100%",
        display: 'flex',
    },
    content: {
        flex: '1',
        margin: '1rem',
        borderRadius: '0.5rem',
        outline: 'none',
        fontSize: "1.4rem",
        fontFamily: 'Consolas, Helvetica, "Microsoft YaHei", sans-serif"',
        color: tokens.colorNeutralForeground3,
    },
})

export function PreviewText(props: { url: string, category: string, content_type: string }) {
    const styles = useStyles()
    const [text, set_text] = useState("");

    useEffect(() => {
        fetch(props.url).then(res => res.blob()).then(res => {
            console.log('[x] res =', res)
            res.arrayBuffer().then(buf => {
                const view = new TextDecoder().decode(buf);
                set_text(view)
            })
        })
    }, [])

    return <div className={styles.container}>
        <textarea className={styles.content} value={text}></textarea>
    </div>
}