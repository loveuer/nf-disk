import {
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
import { useState } from "react";
import { CheckmarkFilled, DismissRegular } from "@fluentui/react-icons";
import { useToast } from "../../message";
import { Dial } from "../../api";
import { useStoreConnection } from "../../store/connection";

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

export interface ConnectionCreateProps {
  openFn: (open: boolean) => void;
}

export function ConnectionCreate(props: ConnectionCreateProps) {
  const actionStyle = useActionStyle();
  const { dispatchMessage } = useToast();
  const [testLoading, setTestLoading] = useState<
    "initial" | "loading" | "success" | "error"
  >("initial");
  const { conn_get } = useStoreConnection();
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

  async function test() {
    setTestLoading("loading");
    let res = await Dial<string>("/api/connection/test", value);
    const status = res.status === 200 ? "success" : "error";
    setTestLoading(status);
    dispatchMessage(res.msg, status);
  }

  async function create() {
    let res = await Dial("/api/connection/create", value);
    dispatchMessage(res.msg, res.status === 200 ? "success" : "error");
    if (res.status === 200) {
      dispatchMessage("新建连接成功", "success");
      await conn_get();
      props.openFn(false);
    }
  }

  return (
    <>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>新建S3连接</DialogTitle>
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
                      placeholder=""
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
                      placeholder=""
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
                await create();
              }}
              appearance="primary"
            >
              新建
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </>
  );
}
