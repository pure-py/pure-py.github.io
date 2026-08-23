<script lang="ts">
  import type { EditorView } from "codemirror";
  import { onMount } from "svelte";

  type Props = {
    initial_value: string;
    onupdate: (value: string) => void;
  };

  let { initial_value, onupdate }: Props = $props();

  let element: HTMLDivElement;
  let view: EditorView | undefined;

  let ready_resolve: () => void;
  export const ready = new Promise<void>(
    (resolve) => (ready_resolve = resolve),
  );

  export const set_doc = async (src: string) => {
    await ready;
    if (view === undefined) {
      // never
      return;
    }
    const tx = view.state.update({ changes: { from: 0, insert: src } });
    view.dispatch(tx);
  };

  const setup = async () => {
    const [{ basicSetup, EditorView }, { python }, { oneDark }] =
      await Promise.all([
        import("codemirror"),
        import("@codemirror/lang-python"),
        import("@codemirror/theme-one-dark"),
      ]);

    view = new EditorView({
      doc: initial_value,
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

    ready_resolve();
  };

  onMount(() => {
    setup();
    return () => {
      view?.destroy();
    };
  });
</script>

<div class="h-full w-full" id="editor" bind:this={element}></div>
