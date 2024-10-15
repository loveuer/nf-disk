import {makeStyles, MenuItem, MenuList, Text, tokens} from "@fluentui/react-components";
import {ArchiveRegular} from "@fluentui/react-icons";
import {VirtualizerScrollView} from "@fluentui/react-components/unstable";
import React from "react";
import {useStoreBucket} from "../../store/bucket";
import {Bucket} from "../../interfaces/connection";
import {useStoreFile, useStoreFileFilter} from "../../store/file";
import {useStoreConnection} from "../../store/connection";

const useStyles = makeStyles({
    container: {
        marginTop: '0.5rem',
        maxWidth: 'calc(100vw - 25rem - 1px)',
    },
    row: {
        height: '32px',
        display: 'flex',
        marginLeft: '0.5rem',
        marginRight: '0.5rem',
    },
    item: {
        width: '100%',
        maxWidth: '100%',
        "&:hover": {
            color: tokens.colorNeutralForeground2BrandPressed,
        }
    },
    text: {
        overflow: 'hidden',
        width: 'calc(100vw - 32rem)',
        display: "block",
    }
})

export function ListBucketComponent() {

    const styles = useStyles();
    const {bucket_set, bucket_list} = useStoreBucket()
    const {filter_set, prefix_set} = useStoreFileFilter()

    async function handleClick(item: Bucket) {
        await bucket_set(item)
        await filter_set('')
        await prefix_set('')
    }

    function handleRightClick(e: React.MouseEvent<HTMLDivElement>, item: Bucket) {
        e.preventDefault()
    }

    return <MenuList className={styles.container}>
        <VirtualizerScrollView
            numItems={bucket_list ? bucket_list.length : 0}
            itemSize={32}
            container={{role: 'list', style: {maxHeight: 'calc(100vh - 9rem)'}}}
        >
            {(idx) => {
                return <div
                    className={styles.row} key={idx}
                    onClick={async () => {
                        await handleClick(bucket_list[idx])
                    }}
                    onContextMenu={async (e) => {
                        handleRightClick(e, bucket_list[idx])
                    }}>
                    <MenuItem className={styles.item}
                              icon={<ArchiveRegular/>}>
                        <Text truncate wrap={false} className={styles.text}>
                            {bucket_list[idx].name}
                        </Text>
                    </MenuItem>
                </div>
            }}
        </VirtualizerScrollView>
    </MenuList>
}