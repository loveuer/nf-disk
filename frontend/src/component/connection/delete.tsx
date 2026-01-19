import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Subtitle2,
  tokens,
} from "@fluentui/react-components";
import { DeleteRegular } from "@fluentui/react-icons";
import React from "react";

interface ConnectionDeleteDialogProps {
  connectionName: string;
  onDelete: () => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean, event?: any) => void;
}

export function ConnectionDeleteDialog({
  connectionName,
  onDelete,
  open,
  onOpenChange,
}: ConnectionDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      onOpenChange(false);
    } catch (error) {
      console.error("删除连接失败:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (event: any, data: any) => {
    onOpenChange(data.open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>删除连接</DialogTitle>
          <DialogContent>
            <Subtitle2 
              style={{ 
                color: tokens.colorNeutralStroke1,
                marginBottom: tokens.spacingVerticalM,
              }}
            >
              确定要删除连接 "{connectionName}" 吗？
            </Subtitle2>
            <Subtitle2 
              style={{ 
                color: tokens.colorNeutralStroke1,
              }}
            >
              此操作将删除该连接的所有配置信息，且无法恢复。
            </Subtitle2>
          </DialogContent>
          <DialogActions>
            <DialogTrigger>
              <Button appearance="secondary">取消</Button>
            </DialogTrigger>
            <Button
              appearance="primary"
              style={{ backgroundColor: '#d13438', borderColor: '#d13438' }}
              icon={<DeleteRegular />}
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "删除中..." : "确认删除"}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}