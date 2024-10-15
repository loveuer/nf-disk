import {Button, makeStyles, tokens, Text, Tooltip} from "@fluentui/react-components";
import {DismissRegular} from "@fluentui/react-icons";
import {useEffect} from "react";

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

export function PreviewFile(props: { url: string, content_type: string, close: () => void }) {
    const styles = useStyle()

    const category = props.content_type.split('/')[0]

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

    switch (category) {
        case "image":
            return <div className={styles.container} style={{display: props.url?'flex':'none'}}>
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
                    <img src={props.url} alt={''}/>
                </div>
            </div>
        default:
            return <div className={styles.container}>
                <Text>该文件无法预览</Text>
            </div>
    }

}