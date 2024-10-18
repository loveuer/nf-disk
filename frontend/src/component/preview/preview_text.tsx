import {useEffect, useState} from "react";
import {makeStyles, Textarea, tokens} from "@fluentui/react-components";
import {marked} from "marked";

const useStyles = makeStyles({
    container: {
        height: "100%",
        width: "100%",
    },
    content: {
        height: "100%",
        width: "100%",
        border: 'none',
        color: tokens.colorNeutralForeground3,

        "& pre": {
            background: '#f4f4f4',
            border: '1px solid #ddd', /* 边框 */
            padding: '10px', /* 内边距 */
            overflowX: 'auto', /* 当内容超出宽度时显示滚动条 */
            fontFamily: "'Courier New', Courier, monospace", /* 设置字体 */
            lineHeight: '1.5', /* 行高 */
        },
        '& code': {
            fontSize: '1.5 rem',
            color: '#333',
        },
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
                const view2 = "```\n" + view + "\n```"
                const content = marked.parse(view2.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, ""));
                console.log('[X] parsed content =', content)
                if (typeof content === 'string') {
                    set_text(content)
                }
            })
        })
    }, [])

    return <div className={styles.container}>
        <div className={styles.content} dangerouslySetInnerHTML={{__html: text}}></div>
    </div>
}