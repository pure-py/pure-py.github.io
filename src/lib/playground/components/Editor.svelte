<script lang="ts">
  import type { EditorView } from "codemirror";
  import { onMount } from "svelte";
  import type { State } from "../lib/app.svelte";

  let { app }: { app: State } = $props();

  let element: HTMLDivElement;
  let view: EditorView | undefined;

  let ready_resolve: () => void;
  export const ready = new Promise<void>(
    (resolve) => (ready_resolve = resolve),
  );

  const setup = async () => {
    const [{ basicSetup, EditorView }, { python }, { oneDark }] =
      await Promise.all([
        import("codemirror"),
        import("@codemirror/lang-python"),
        import("@codemirror/theme-one-dark"),
      ]);

    const _view = new EditorView({
      doc: app.active_file.get_buffer(),
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
        app.active_file.set_buffer(view.state.doc.toString());
      },
    });

    view = _view;

    app.register_editor({
      set_doc: (data: string) => {
        const tx = _view.state.update({
          changes: { from: 0, to: _view.state.doc.length, insert: data },
        });
        _view.dispatch(tx);
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

<div
  class="h-full w-full border-t-zinc-500"
  id="editor"
  bind:this={element}
></div>
