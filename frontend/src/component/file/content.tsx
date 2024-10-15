import {Path} from "./path";
import {ListBucketComponent} from "../bucket/list_bucket";
import {makeStyles} from "@fluentui/react-components";
import {useStoreBucket} from "../../store/bucket";
import {ListFileComponent} from "./list_file";
import {useState} from "react";
import {PreviewFile} from "../preview/preview";

const useStyles = makeStyles({
    content: {
        flex: '1',
        display: "flex",
        flexDirection: 'column',
        height: "100%",
        width: "100%",
    },
})

export function Content() {

    const styles = useStyles()
    const [preview, set_preview] = useState<{ url: string, content_type: string }>({url: '', content_type: ''})
    const {bucket_active} = useStoreBucket()

    const closeFn = () => {
        set_preview({url: '', content_type: ''})
    }

    return <div className={styles.content}>
        <Path/>
        {
            preview.url ? <PreviewFile url={preview.url} content_type={preview.content_type} close={closeFn}/> :
                (
                    bucket_active ?
                        <ListFileComponent set_preview_fn={set_preview}/> : <ListBucketComponent/>
                )
        }
    </div>
}