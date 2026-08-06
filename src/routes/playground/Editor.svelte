<script lang="ts">
  import { onMount } from "svelte";

  type Props = { value: string; onupdate: (value: string) => void };

  let { value, onupdate }: Props = $props();

  let element: HTMLDivElement;
  let loading = $state(true);

  onMount(async () => {
    const [{ basicSetup }, { EditorView }, { python }] = await Promise.all([
      import("codemirror"),
      import("@codemirror/view"),
      import("@codemirror/lang-python"),
    ]);

    loading = false;

    const theme = EditorView.baseTheme({
      "&": { height: "100%", "max-height": "100%", width: "100%" },
    });

    const view = new EditorView({
      doc: value,
      extensions: [basicSetup, theme, python()],
      parent: element,

      dispatchTransactions: (txs, view) => {
        view.update(txs);
        onupdate(view.state.doc.toString());
      },
    });

    return () => view?.destroy();
  });
</script>

<div id="editor" bind:this={element}>
  {#if loading}
    Loading...
  {/if}
</div>
