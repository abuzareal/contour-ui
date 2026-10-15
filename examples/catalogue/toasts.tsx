import { Button, ToastProvider, useToast } from "@abuzareal/contour-ui";

function DemoNotice() {
  const { show } = useToast();
  return (
    <Button
      onClick={() =>
        show({ title: "Example notification", message: "No data was saved." })
      }
    >
      Show example
    </Button>
  );
}
export default function App() {
  return (
    <ToastProvider>
      <DemoNotice />
    </ToastProvider>
  );
}
