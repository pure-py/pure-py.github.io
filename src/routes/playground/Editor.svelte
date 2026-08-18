<script lang="ts">
  import { onMount } from "svelte";

  type Props = { value: string; onupdate: (value: string) => void };

  let { value, onupdate }: Props = $props();

  let element: HTMLDivElement;
  let loading = $state(true);

  onMount(async () => {
    const [{ basicSetup, EditorView }, { python }, { oneDark }] =
      await Promise.all([
        import("codemirror"),
        import("@codemirror/lang-python"),
        import("@codemirror/theme-one-dark"),
      ]);

    loading = false;

    const view = new EditorView({
      doc: value,
      extensions: [
        basicSetup,
        oneDark,
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "14px",
          },
        }),
        python(),
      ],
      parent: element,

      dispatchTransactions: (txs, view) => {
        view.update(txs);
        onupdate(view.state.doc.toString());
      },
    });

    return () => view?.destroy();
  });
</script>

<div class="h-full w-full" id="editor" bind:this={element}>
  {#if loading}
    Loading...
  {/if}
</div>
