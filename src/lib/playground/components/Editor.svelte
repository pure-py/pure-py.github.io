<script lang="ts">
  import {
    StateEffect,
    StateField,
    RangeSetBuilder,
    Transaction,
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

  const is_undo = (transaction: Transaction) => {
    const user_event = transaction.annotation(Transaction.userEvent);

    return user_event === "undo" || user_event?.startsWith("undo.") === true;
  };

  const inline_diagnostics = StateField.define<InlineDiagnostic[]>({
    create: () => [],

    update(diagnostics, transaction) {
      if (transaction.docChanged) {
        if (is_undo(transaction)) {
          const inverse_changes = transaction.changes.invert(
            transaction.startState.doc,
          );

          diagnostics = diagnostics.map((diagnostic) => ({
            ...diagnostic,
            from: inverse_changes.mapPos(diagnostic.from, 1),
            to: inverse_changes.mapPos(diagnostic.to, 1),
          }));
        } else {
          const kept_diagnostics: InlineDiagnostic[] = [];

          for (const diagnostic of diagnostics) {
            const line = transaction.startState.doc.lineAt(diagnostic.from);
            const invalidation_end = line.to;

            let invalidated = false;

            transaction.changes.iterChangedRanges(
              (from_a, to_a, _from_b, _to_b) => {
                if (invalidated) return;

                const touches_diagnostic_region =
                  from_a === to_a
                    ? from_a >= diagnostic.from && from_a <= invalidation_end
                    : from_a < invalidation_end && to_a > diagnostic.from;

                if (touches_diagnostic_region) {
                  invalidated = true;
                }
              },
            );

            if (!invalidated) {
              kept_diagnostics.push({
                ...diagnostic,
                from: transaction.changes.mapPos(diagnostic.from, 1),
                to: transaction.changes.mapPos(diagnostic.to, 1),
              });
            }
          }

          diagnostics = kept_diagnostics;
        }
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

    const _view = new EditorView({
      doc: app.buffer,
      extensions: [
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
      ],
      parent: element,

      dispatchTransactions: (txs, editor_view) => {
        editor_view.update(txs);
        app.buffer = editor_view.state.doc.toString();
      },
    });

    view = _view;

    app.register_editor({
      set_doc: (data: string) => {
        const transaction = _view.state.update({
          changes: {
            from: 0,
            to: _view.state.doc.length,
            insert: data,
          },
        });

        _view.dispatch(transaction);
      },

      set_diagnostics: (diagnostics) => {
        const active_file = app.current_file;

        const inline_diagnostics = diagnostics
          .filter(
            (
              diagnostic,
            ): diagnostic is typeof diagnostic & {
              line: number;
            } => diagnostic.line !== null,
          )
          .filter((diagnostic) => diagnostic.file === active_file)
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
