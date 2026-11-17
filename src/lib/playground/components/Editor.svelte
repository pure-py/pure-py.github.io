<script lang="ts">
  import {
    EditorState,
    StateEffect,
    StateField,
    RangeSetBuilder,
  } from "@codemirror/state";
  import { Decoration, EditorView, WidgetType } from "@codemirror/view";
  import { onMount } from "svelte";
  import type { State } from "../lib/app.svelte";

  let { app }: { app: State } = $props();

  let element: HTMLDivElement;
  let view: EditorView | undefined;

  let ready_resolve: () => void;
  export const ready = new Promise<void>(
    (resolve) => (ready_resolve = resolve),
  );

  type InlineDiagnostic = {
    from: number;
    to: number;
    message: string;
  };

  const set_inline_diagnostics = StateEffect.define<InlineDiagnostic[]>();

  class InlineDiagnosticWidget extends WidgetType {
    message: string;

    constructor(message: string) {
      super();
      this.message = message;
    }

    eq(other: InlineDiagnosticWidget) {
      return other.message === this.message;
    }

    toDOM() {
      const wrapper = document.createElement("span");
      wrapper.className = "cm-inline-diagnostic";
      wrapper.textContent = this.message;
      return wrapper;
    }

    ignoreEvent() {
      return true;
    }
  }

  const inline_diagnostics = StateField.define<InlineDiagnostic[]>({
    create: () => [],

    update(diagnostics, transaction) {
      if (transaction.docChanged) {
        diagnostics = diagnostics
          .filter(({ from, to }) => !transaction.changes.touchesRange(from, to))
          .map((diagnostic) => ({
            ...diagnostic,
            from: transaction.changes.mapPos(diagnostic.from, 1),
            to: transaction.changes.mapPos(diagnostic.to, 1),
          }));
      }

      for (const effect of transaction.effects) {
        if (effect.is(set_inline_diagnostics)) {
          diagnostics = effect.value;
        }
      }

      return diagnostics;
    },
  });

  const inline_diagnostic_decorations = EditorView.decorations.compute(
    [inline_diagnostics],
    (state) => {
      const diagnostics = [...state.field(inline_diagnostics)].sort(
        (a, b) => a.from - b.from || a.to - b.to,
      );

      const builder = new RangeSetBuilder<Decoration>();

      for (const diagnostic of diagnostics) {
        const from = Math.max(0, Math.min(diagnostic.from, state.doc.length));
        const to = Math.max(from, Math.min(diagnostic.to, state.doc.length));

        builder.add(
          from,
          to,
          Decoration.mark({
            class: "cm-diagnostic-underline",
          }),
        );

        builder.add(
          to,
          to,
          Decoration.widget({
            widget: new InlineDiagnosticWidget(diagnostic.message),
            side: 1,
          }),
        );
      }

      return builder.finish();
    },
  );

  const setup = async () => {
    const [{ basicSetup }, { python }, { oneDark }] = await Promise.all([
      import("codemirror"),
      import("@codemirror/lang-python"),
      import("@codemirror/theme-one-dark"),
    ]);

    const extensions = [
      basicSetup,
      oneDark,
      inline_diagnostics,
      inline_diagnostic_decorations,
      EditorView.theme({
        "&": {
          height: "100%",
          fontSize: "14px",
        },
      }),
      python(),
    ];

    const _view = new EditorView({
      parent: element,

      dispatchTransactions: (txs, editor_view) => {
        editor_view.update(txs);
        app.buffer = editor_view.state.doc.toString();
      },
    });

    view = _view;

    // Editor state and scroll position of each file at last switch to another file
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- not reactive state
    const saved = new Map<
      symbol,
      { state: EditorState; scroll: StateEffect<unknown> }
    >();

    // File shown in editor; undefined before first file opens and after shown file closes
    let active: symbol | undefined;

    app.register_editor({
      open: (file) => {
        if (active !== undefined) {
          saved.set(active, {
            state: _view.state,
            scroll: _view.scrollSnapshot(),
          });
        }

        active = file.id;

        const restored = saved.get(file.id);

        if (restored === undefined) {
          _view.setState(EditorState.create({ doc: file.buffer, extensions }));
          _view.scrollDOM.scrollTo(0, 0);
        } else {
          _view.setState(restored.state);
          _view.dispatch({ effects: restored.scroll });
        }
      },

      close: (file) => {
        saved.delete(file.id);

        if (active === file.id) {
          active = undefined;
        }
      },

      set_diagnostics: (diagnostics) => {
        const inline_diagnostics = diagnostics
          .filter(
            (
              diagnostic,
            ): diagnostic is typeof diagnostic & {
              line: number;
            } => diagnostic.line !== null,
          )
          .filter(
            (diagnostic) =>
              diagnostic.line >= 1 && diagnostic.line <= _view.state.doc.lines,
          )
          .map((diagnostic) => {
            const line = _view.state.doc.line(diagnostic.line);
            const column = Math.max(1, diagnostic.col ?? 1);
            const from = Math.min(line.from + column - 1, line.to);

            return {
              from,
              to: line.to,
              message: diagnostic.message,
            };
          });

        _view.dispatch({
          effects: set_inline_diagnostics.of(inline_diagnostics),
        });
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
