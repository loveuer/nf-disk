import {
  Button,
  Input,
  makeStyles,
  MenuItem,
  MenuList,
  mergeClasses,
  tokens,
  Tooltip,
} from "@fluentui/react-components";
import {
  DatabaseLinkRegular,
  DeleteRegular,
  DismissRegular,
  PlugConnectedRegular,
  PlugDisconnectedRegular,
  SettingsRegular,
} from "@fluentui/react-icons";
import React, { useEffect, useState } from "react";
import { Connection } from "../../interfaces/connection";
import { useToast } from "../../message";
import { Dial } from "../../api";
import { useStoreConnection } from "../../store/connection";
import { useStoreBucket } from "../../store/bucket";

const useStyles = makeStyles({
  list: {
    display: "flex",
    flexDirection: "row",
    height: "100%",
    width: "25rem",
  },
  content: {
    height: "100%",
    width: "25rem",
    display: "flex",
    flexDirection: "column",
  },
  filter: {
    height: "4rem",
    width: "100%",
    display: "flex",
    alignItems: "center",
  },
  filter_input: {
    width: "100%",
    marginLeft: "0.5rem",
    marginRight: "0.5rem",
  },
  ctx_menu: {
    position: "absolute",
    zIndex: "1000",
    width: "15rem",
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: `${tokens.shadow16}`,
    paddingTop: "4px",
    paddingBottom: "4px",
  },
  items: {
    height: "100%",
    width: "100%",
  },
  items_one: {
    marginLeft: "0.5rem",
    marginRight: "0.5rem",
    "&:hover": {
      color: tokens.colorNeutralForeground2BrandPressed,
    },
    "&.active": {
      color: tokens.colorNeutralForeground2BrandPressed,
      fontWeight: "bold",
    },
    "& > span": {
      display: "flex",
    },
  },
  items_disconn: {
    marginLeft: "auto",
  },
  slider: {
    height: "100%",
    width: "1px",
    // todo: resize
    // cursor: 'ew-resize',
    "& > div": {
      height: "100%",
      width: "1px",
      backgroundColor: "lightgray",
    },
  },
});

export function ConnectionList() {
  const styles = useStyles();
  const { dispatchMessage } = useToast();
  const { conn_get, conn_list, conn_set } = useStoreConnection();
  const [conn_filter, set_conn_filter] = useState<string>("");
  const { bucket_get, bucket_set } = useStoreBucket();
  const [ctx_menu, set_ctx_menu] = useState<{
    x: number;
    y: number;
    display: "none" | "block";
  }>({ x: 0, y: 0, display: "none" });
  const [menu_conn, set_menu_conn] = useState<Connection | null>(null);

  useEffect(() => {
    document.addEventListener("click", (e) => {
      set_ctx_menu({ x: 0, y: 0, display: "none" });
    });
    setTimeout(() => {
      conn_get().then();
    }, 1000);
    return () => {
      document.removeEventListener("click", (e) => {});
    };
  }, []);

  async function handleSelect(item: Connection) {
    conn_list.map((one: Connection) => {
      if (item.id === one.id && one.active) {
        conn_set(one);
        bucket_get(one, false);
        bucket_set(null);
      }
    });
  }

  async function handleConnect(item: Connection | null) {
    if (!item) return;
    let res = await Dial("/api/connection/connect", { id: item.id });
    if (res.status !== 200) {
      dispatchMessage(res.msg, "error");
      return;
    }

    await conn_set({ ...item, active: true });
    bucket_get(item, true);
    await bucket_set(null);
  }

  async function handleDisconnect(item: Connection | null) {
    if (!item) return;
    let res = await Dial("/api/connection/disconnect", { id: item.id });
    if (res.status !== 200) {
      dispatchMessage(res.msg, "error");
      return;
    }
    await conn_set({ ...item, active: false });
  }

  async function handleRightClick(
    e: React.MouseEvent<HTMLDivElement>,
    item: Connection
  ) {
    e.preventDefault();
    set_menu_conn(item);

    const ele = document.querySelector("#list-connection-container");
    const eleX = ele ? ele.clientWidth : 0;
    const eleY = ele ? ele.clientHeight : 0;
    const positionX =
      e.pageX + eleX > window.innerWidth ? e.pageX - eleX : e.pageX;
    const positionY =
      e.pageY + eleY > window.innerHeight ? e.pageY - eleY : e.pageY;

    set_ctx_menu({
      x: positionX,
      y: positionY,
      display: "block",
    });
  }

  return (
    <div className={styles.list}>
      <div className={styles.content}>
        <div className={styles.filter}>
          <Input
            value={conn_filter}
            className={styles.filter_input}
            contentAfter={
              <Button
                appearance={"transparent"}
                onClick={async () => {
                  set_conn_filter("");
                }}
                size="small"
                icon={<DismissRegular />}
              />
            }
            placeholder="搜索连接"
            onChange={(e) => set_conn_filter(e.target.value)}
          />
        </div>
        <div
          id={"list-connection-container"}
          className={styles.ctx_menu}
          style={{
            left: ctx_menu.x,
            top: ctx_menu.y,
            display: ctx_menu.display,
          }}
        >
          <MenuList>
            <MenuItem
              onClick={async () => {
                await handleConnect(menu_conn);
              }}
              icon={<PlugConnectedRegular />}
            >
              连接
            </MenuItem>
            <MenuItem
              onClick={async () => {
                await handleDisconnect(menu_conn);
              }}
              icon={<PlugDisconnectedRegular />}
            >
              断开
            </MenuItem>
            <MenuItem
              onClick={() => {
                dispatchMessage("暂未实现", "warning");
              }}
              icon={<SettingsRegular />}
            >
              设置
            </MenuItem>
            <MenuItem
              onClick={() => {
                dispatchMessage("暂未实现", "warning");
              }}
              icon={<DeleteRegular />}
            >
              删除
            </MenuItem>
          </MenuList>
        </div>
        <div className={styles.items}>
          <MenuList>
            {conn_list
              .filter((item) => item.name.includes(conn_filter))
              .map((item) => {
                return (
                  <MenuItem
                    className={
                      item.active
                        ? mergeClasses(styles.items_one, "active")
                        : styles.items_one
                    }
                    onClick={async () => {
                      await handleSelect(item);
                    }}
                    onDoubleClick={async () => {
                      await handleConnect(item);
                    }}
                    onContextMenu={async (e) => {
                      await handleRightClick(e, item);
                    }}
                    icon={<DatabaseLinkRegular />}
                    key={item.id}
                  >
                    {item.name}
                  </MenuItem>
                );
              })}
          </MenuList>
        </div>
      </div>
      <div className={styles.slider}>
        <div></div>
      </div>
    </div>
  );
}
