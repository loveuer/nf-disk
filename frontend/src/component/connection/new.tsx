import { ConnectionForm } from "./form";

export interface ConnectionCreateProps {
  openFn: (open: boolean) => void;
}

export function ConnectionCreate(props: ConnectionCreateProps) {
  return (
    <ConnectionForm
      onClose={() => props.openFn(false)}
      connection={null}
    />
  );
}
