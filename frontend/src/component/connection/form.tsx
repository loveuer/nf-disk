import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Spinner,
  Field,
  Input,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useState, useEffect } from "react";
import { CheckmarkFilled, DismissRegular } from "@fluentui/react-icons";
import { useToast } from "../../message";
import { Dial } from "../../api";
import { useStoreConnection } from "../../store/connection";
import { Connection } from "../../interfaces/connection";

const useActionStyle = makeStyles({
  container: {
    backgroundColor: tokens.colorNeutralBackground1,
    display: "flex",
    flexDirection: "row",
    height: "100%",
    width: "100%",
    gridColumnStart: 0,
  },
  test: {},
});

export interface ConnectionFormProps {
  open: boolean;
  onOpenChange: (open: boolean, event?: any) => void;
  connection?: Connection | null; // 如果提供，则为编辑模式；否则为新增模式
}

export function ConnectionForm(props: ConnectionFormProps) {
  const actionStyle = useActionStyle();
  const { dispatchMessage } = useToast();
  const [testLoading, setTestLoading] = useState<
    "initial" | "loading" | "success" | "error"
  >("initial");
  const { conn_get } = useStoreConnection();
  const isEdit = props.connection !== null;
  const buttonIcon =
    testLoading === "loading" ? (
      <Spinner size="tiny" />
    ) : testLoading === "success" ? (
      <CheckmarkFilled />
    ) : testLoading === "error" ? (
      <DismissRegular />
    ) : null;
  
  const [value, setValue] = useState<{
    name: string;
    endpoint: string;
    access: string;
    key: string;
  }>({
    name: "",
    endpoint: "",
    access: "",
    key: "",
  });

  // 如果是编辑模式，初始化表单数据
  useEffect(() => {
    if (props.open) {
      if (isEdit && props.connection) {
        setValue({
          name: props.connection.name,
          endpoint: props.connection.endpoint,
          access: props.connection.access || "", // 显示已有的 access，如果没有则为空
          key: props.connection.key || "",     // 显示已有的 key，如果没有则为空
        });
      } else {
        // 新增模式，清空表单
        setValue({
          name: "",
          endpoint: "",
          access: "",
          key: "",
        });
      }
      setTestLoading("initial"); // 重置测试状态
    }
  }, [props.connection, isEdit, props.open]);

  async function test() {
    if (!value.endpoint || !value.access || !value.key) {
      dispatchMessage("请填写完整的连接信息", "warning");
      return;
    }
    
    setTestLoading("loading");
    let res = await Dial<string>("/api/connection/test", value);
    const status = res.status === 200 ? "success" : "error";
    setTestLoading(status);
    dispatchMessage(res.msg, status);
  }

  async function save() {
    if (!value.endpoint || !value.access || !value.key) {
      dispatchMessage("endpoint, secret_access, secret_key 是必填项", "warning");
      return;
    }

    let res;
    if (isEdit && props.connection) {
      // 编辑模式
      res = await Dial("/api/connection/update", {
        id: props.connection.id,
        name: value.name || value.endpoint,
        endpoint: value.endpoint,
        access: value.access,
        key: value.key,
      });
      dispatchMessage(res.msg, res.status === 200 ? "success" : "error");
      if (res.status === 200) {
        dispatchMessage("更新连接成功", "success");
        await conn_get();
        props.onOpenChange(false);
      }
    } else {
      // 新增模式
      res = await Dial("/api/connection/create", value);
      dispatchMessage(res.msg, res.status === 200 ? "success" : "error");
      if (res.status === 200) {
        dispatchMessage("新建连接成功", "success");
        await conn_get();
        props.onOpenChange(false);
      }
    }
  }

  const handleDialogChange = (event: any, data: any) => {
    props.onOpenChange(data.open);
  };

  return (
    <Dialog open={props.open} onOpenChange={handleDialogChange}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{isEdit ? "编辑S3连接" : "新建S3连接"}</DialogTitle>
          <DialogContent>
            <div className="connection-container">
              <div className="connection-form">
                <div className="connection-form-field">
                  <Field label="name">
                    <Input
                      placeholder="名称 (example: 测试S3-minio)"
                      value={value.name}
                      onChange={(e) => {
                        setValue({ ...value, name: e.target.value });
                      }}
                    />
                  </Field>
                </div>
                <div className="connection-form-field">
                  <Field label="endpoint" required>
                    <Input
                      placeholder="地址 (example: https://ip_or_server-name:port)"
                      value={value.endpoint}
                      required
                      onChange={(e) => {
                        setValue({ ...value, endpoint: e.target.value });
                      }}
                    />
                  </Field>
                </div>
                <div className="connection-form-field">
                  <Field label="secret access" required>
                    <Input
                      placeholder={isEdit ? "已回显当前密钥" : ""}
                      required
                      value={value.access}
                      onChange={(e) => {
                        setValue({ ...value, access: e.target.value });
                      }}
                    />
                  </Field>
                </div>
                <div className="connection-form-field">
                  <Field label="secret key" required>
                    <Input
                      placeholder={isEdit ? "已回显当前密钥" : ""}
                      required
                      value={value.key}
                      onChange={(e) => {
                        setValue({ ...value, key: e.target.value });
                      }}
                    />
                  </Field>
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogActions className={actionStyle.container}>
            <Button
              className={actionStyle.test}
              appearance="transparent"
              icon={buttonIcon}
              onClick={async () => await test()}
            >
              测试连接
            </Button>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">取消</Button>
            </DialogTrigger>
            <Button
              onClick={async () => {
                await save();
              }}
              appearance="primary"
            >
              {isEdit ? "保存" : "新建"}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}