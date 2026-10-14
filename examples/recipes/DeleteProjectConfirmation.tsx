"use client";
import { useEffect, useRef, useState } from "react";
import { Button, Dialog } from "@abuzareal/contour-ui";

export type DeleteProjectConfirmationProps = {
  project: { id: string; name: string };
  /** Resolve only after server confirmation. Authorization/idempotency belong on the server. */
  deleteProject: (id: string, signal: AbortSignal) => Promise<void>;
  onDeleted?: (id: string) => void;
};

/** Native Dialog composition; no AlertDialog export or simulated successful deletion. */
export function DeleteProjectConfirmation(
  props: DeleteProjectConfirmationProps,
) {
  // Target identity owns the whole interaction; changing projects cannot reuse a pending confirmation.
  return <ProjectDeletion key={props.project.id} {...props} />;
}

function ProjectDeletion({
  project,
  deleteProject,
  onDeleted,
}: DeleteProjectConfirmationProps) {
  const [open, setOpen] = useState(false),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const cancel = useRef<HTMLButtonElement>(null);
  const active = useRef<AbortController | null>(null);
  // A changed target or unmount invalidates the old operation, even if its transport ignores abort.
  useEffect(() => {
    return () => {
      active.current?.abort();
      active.current = null;
    };
  }, [project.id]);
  const dismiss = () => {
    active.current?.abort();
    active.current = null;
    setPending(false);
    setOpen(false);
    setError("");
  };
  const remove = async () => {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    setPending(true);
    setError("");
    try {
      await deleteProject(project.id, controller.signal);
    } catch {
      if (controller.signal.aborted || active.current !== controller) return;
      active.current = null;
      setPending(false);
      setError(
        "The deletion could not be confirmed. Check the project before retrying.",
      );
      return;
    }
    if (controller.signal.aborted || active.current !== controller) return;
    active.current = null;
    setPending(false);
    setOpen(false);
    onDeleted?.(project.id);
  };
  return (
    <>
      <Button onClick={() => setOpen(true)}>Delete {project.name}</Button>
      <Dialog
        title={`Delete ${project.name}?`}
        open={open}
        onClose={dismiss}
        initialFocus={cancel}
        description="Deleting this project permanently removes its saved settings. This action cannot be undone."
        closeButtonProps={{ "aria-label": "Cancel deletion" }}
        footer={
          <>
            <Button ref={cancel} variant="secondary" onClick={dismiss}>
              Keep project
            </Button>
            <Button disabled={pending} onClick={() => void remove()}>
              {pending ? "Deleting…" : "Permanently delete project"}
            </Button>
          </>
        }
      >
        <p role="status">
          {pending
            ? "Waiting for server confirmation. Closing stops waiting; the server may still complete the deletion."
            : "No action is taken until you confirm."}
        </p>
        {error && <p role="alert">{error}</p>}
      </Dialog>
    </>
  );
}
