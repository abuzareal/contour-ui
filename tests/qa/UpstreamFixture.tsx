import { Combobox } from "@base-ui/react/combobox";
const items = ["Atlas", "Field notes", "Café"];
/** Minimal public Base UI composition; no Contour adapter, layer or portal wrapper. */
export default function UpstreamFixture() {
  return (
    <main className="qa-page">
      <h1>Upstream Combobox reproduction</h1>
      <p>Synthetic data. Base UI1.9.0, modal=false, input outside popup.</p>
      <button type="button">Before picker</button>
      <Combobox.Root items={items} defaultValue="Atlas" modal={false}>
        <label htmlFor="upstream-picker">Upstream project</label>
        <Combobox.Input id="upstream-picker" />
        <Combobox.Portal>
          <Combobox.Positioner style={{ zIndex: 10 }}>
            <Combobox.Popup>
              <Combobox.List>
                {(item: string) => (
                  <Combobox.Item key={item} value={item}>
                    {item}
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
      <button type="button">After picker</button>
      <p>
        The zero-violation assertion is kept intact; this fixture does not waive
        findings.
      </p>
    </main>
  );
}
