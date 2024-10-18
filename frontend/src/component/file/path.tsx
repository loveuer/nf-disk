import {Button, Input, makeStyles, Text, tokens, Tooltip} from "@fluentui/react-components";
import {useStoreBucket} from "../../store/bucket";
import {ArchiveRegular, ArrowCurveUpLeftFilled} from "@fluentui/react-icons";
import {useStoreFile, useStoreFileFilter} from "../../store/file";
import React, {useEffect, useState} from "react";
import {debounce} from 'lodash'
import {useStoreConnection} from "../../store/connection";
import {ListFileComponent} from "./list_file";
import {ListBucketComponent} from "../bucket/list_bucket";

const useStyles = makeStyles({
    container: {
        height: '4rem',
        width: '100%',
        borderBottom: '1px solid lightgray',
        display: 'flex',
        alignItems: 'center',
    },
    show: {
        marginLeft: '0.5rem',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
    },
    show_line: {
        display: 'flex',
        alignItems: 'center',
    },
    show_text: {
        backgroundColor: tokens.colorNeutralBackground1Hover,
        padding: '0.5rem 0.5rem',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        display: 'block',
        alignItems: 'center',
        marginLeft: '0.5rem',
        overflow: 'hidden',
        maxWidth: '8rem',
        verticalAlign: 'middle',
        '&:hover': {
            textDecoration: 'none',
            backgroundColor: tokens.colorNeutralBackground1Pressed,
        },
        '& > div': {
            height: '100%',
            display: 'flex',
            alignItems: 'center',
        },
    },
    op_up: {},
    filter_prefix: {
        margin: '0.5rem',
    },
})


export function Path() {
    const styles = useStyles()
    const {conn_active} = useStoreConnection()
    const {bucket_active, bucket_get, bucket_set} = useStoreBucket()
    const {prefix, filter, prefix_set, filter_set} = useStoreFileFilter()

    useEffect(() => {
        document.addEventListener('mouseup', (e) => {
            e.preventDefault();
            if (e.button === 3) {
                handleClickUp().then()
            }
        })

        return () => {
            document.removeEventListener("mouseup", (e) => {});
        }
    }, [prefix]);

    async function handleClickUp() {
        const dirs = prefix.split('/').filter((item => item))
        if (dirs.length > 0) {
            dirs.pop()
            await prefix_set(dirs.join('/'))
            return
        }

        bucket_get(conn_active!, false)
        await bucket_set(null)
    }


    const handleFilterChange = debounce(async (e) => {
        await filter_set(e.target.value)
    }, 500)

    return <div className={styles.container}>
        {bucket_active && (
            <>
                <div className={styles.show}>
                    <Tooltip content="返回上一级" relationship="label">
                        <Button className={styles.op_up}
                                onClick={async () => {
                                    await handleClickUp()
                                }}
                                size="small" icon={<ArrowCurveUpLeftFilled/>}/>
                    </Tooltip>
                    <Tooltip content={bucket_active.name} relationship={'description'}>
                        <Text className={styles.show_text}
                              truncate
                              wrap={false}
                              align={'justify'}
                              style={{maxWidth: '16rem'}}
                        >
                            <div>
                                <ArchiveRegular style={{margin: '0rem 0.5rem 0 0'}}/>
                                {bucket_active.name}
                            </div>
                        </Text>
                    </Tooltip>
                    {prefix && (
                        prefix.split("/").filter(item => item).map((item, idx) => {
                            return <div className={styles.show_line} key={idx}>
                                <Text style={{marginLeft: '0.5rem'}}>/</Text>
                                <Text className={styles.show_text} truncate wrap={false}>{item}</Text>
                            </div>
                        })
                    )}
                </div>
                <div className={styles.filter_prefix}>
                    <Input
                        onChange={(e) => {
                            handleFilterChange(e)
                        }}
                        placeholder={"输入前缀过滤"}
                        // contentBefore={<Text>/</Text>}
                    />
                </div>
            </>
        )}
    </div>
}
