import {
    DialogTrigger,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
    Button,  Field, Input,  makeStyles, tokens,  Checkbox,
} from "@fluentui/react-components";
import {useState} from "react";
import {useToast} from "../../message";
import {useStoreConnection} from "../../store/connection";
import {useStoreBucket} from "../../store/bucket";

const useStyle = makeStyles({
    container: {
        backgroundColor: tokens.colorNeutralBackground1,
        display: "flex",
        flexDirection: "row",
        height: "100%",
        width: "100%",
        gridColumnStart: 0,
    },
    content: {},
    input: {
        margin: '1rem',
    },
    checks: {
        margin: '1rem',
        display: "flex",
    },
});

export interface BucketCreateProps {
    openFn: (open: boolean) => void;
}

export function BucketCreate(props: BucketCreateProps) {
    const styles = useStyle();
    const {dispatchMessage} = useToast();

    const [name, set_name] = useState<string>();
    const [public_read, set_public_read] = useState(false);
    const [public_read_write, set_public_read_write] = useState(false);

    const {conn_active} = useStoreConnection();
    const {bucket_create, bucket_get} = useStoreBucket()

    async function create() {
        if (!name) {
            dispatchMessage('桶名不能为空', "warning")
            return
        }

        bucket_create(conn_active!, name, public_read, public_read_write);
        bucket_get(conn_active!, true)
        props.openFn(false)
    }

    return <>
        <DialogSurface>
            <DialogBody>
                <DialogTitle>在 {conn_active?.name} 新建桶</DialogTitle>
                <DialogContent>
                    <div className={styles.content}>
                        <Field className={styles.input} label="桶名">
                            <Input
                                value={name}
                                onChange={(e) => {
                                    set_name(e.target.value)
                                }}></Input>
                        </Field>
                        <div className={styles.checks}>
                            <Field>
                                <Checkbox
                                    checked={public_read}
                                    onChange={(e) => {
                                        if (public_read_write) {
                                            return
                                        }

                                        set_public_read(e.target.checked);
                                    }}
                                    label={"公共读"}></Checkbox>
                            </Field>
                            <Field>
                                <Checkbox
                                    checked={public_read_write}
                                    onChange={(e) => {
                                        set_public_read_write(e.target.checked)
                                        if (e.target.checked) {
                                            set_public_read(e.target.checked)
                                        }
                                    }}
                                    label={"公共读/写"}></Checkbox>
                            </Field>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions className={styles.container}>
                    <DialogTrigger disableButtonEnhancement>
                        <Button appearance="secondary">取消</Button>
                    </DialogTrigger>
                    <Button onClick={async () => {
                        await create()
                    }} appearance="primary">新建</Button>
                </DialogActions>
            </DialogBody>
        </DialogSurface>
    </>
}
