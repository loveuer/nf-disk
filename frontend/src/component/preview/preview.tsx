import {Button, makeStyles, tokens, Text, Tooltip} from "@fluentui/react-components";
import {DismissRegular} from "@fluentui/react-icons";
import {useEffect} from "react";
import {PreviewText} from "./preview_text";

const useStyle = makeStyles({
    container: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100vw',
        maxWidth: '100vw',
        height: '100vh',
        maxHeight: '100vh',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: tokens.colorNeutralBackground1,
    },
    header: {
        height: '4rem',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
    },
    header_close_button: {
        marginLeft: 'auto',
    },
    body: {
        width: '100%',
        maxWidth: '100%',
        height: 'calc(100% - 4rem - 1px)',
        maxHeight: 'calc(100% - 4rem - 1px)',
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '& > img': {
            maxWidth: '100%',
            width: 'auto',
            maxHeight: '100%',
        }
    },
})

export function Preview(props: { url: string, content_type: string, close: () => void }) {
    const styles = useStyle()

    const category = props.content_type.split('/')[0]
    const content_type = props.content_type.split('/')[1]

    useEffect(() => {
        window.addEventListener('keyup', (e) => {
            if (e.key === 'Escape') {
                props.close()
            }
        })

        return () => {
            window.removeEventListener('keyup', () => {
            })
        }
    }, [])

    return <div className={styles.container} style={{display: props.url ? 'flex' : 'none'}}>
        <div className={styles.header}>
            <Tooltip content={'退出预览'} relationship={'description'}>
                <Button
                    size="large"
                    appearance="transparent"
                    className={styles.header_close_button}
                    onClick={() => {
                        props.close()
                    }}>
                    <DismissRegular/>
                </Button>
            </Tooltip>
        </div>
        <div className={styles.body}>
            <PreviewFile url={props.url} category={category} content_type={content_type} />
        </div>
    </div>

}

function PreviewFile(props: { url: string, category: string, content_type: string }) {
    switch (props.category) {
        case "image":
            return <img src={props.url} alt={''}/>
        case "application":
            return <PreviewText url={props.url} category={props.category} content_type={props.content_type} />
        case "text":
            return <PreviewText url={props.url} category={props.category} content_type={props.content_type} />
        default:
            return <Text>该文件无法预览</Text>
    }
}
