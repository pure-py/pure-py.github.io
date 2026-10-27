import { to_nonempty, type NonEmpty } from "#lib/utils/non-empty.js";
import { once } from "#lib/utils/once.js";
import { SvelteDate } from "svelte/reactivity";
import { type StaticFile, FileSystem } from "./file.svelte";
import { PUREPY_TAG, PUREPY_VERSION, type PurePy } from "./purepy";
import type { SharableState } from "./share/codec";
import { Stdout } from "./stdout.svelte";

const example_sources = import.meta.glob("#lib/assets/examples/**/*.py", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const example_files: StaticFile[] = Object.entries(example_sources)
  .map(([file, data]) => ({
    path: file.replace(/^.*assets\/examples\//, ""),
    data,
  }))
  .sort((a, b) => a.path.localeCompare(b.path));

type EditorDiagnostic = {
  file: string | null;
  line: number | null;
  col: number | null;
  message: string;
};

type Editor = {
  set_doc: (str: string) => void;
  set_diagnostics: (diagnostics: EditorDiagnostic[]) => void;
};

export type Result = {
  success: boolean;
  time: number;
};

export class State {
  #fs: FileSystem;
  #purepy: PurePy | null = null;
  #stdout: Stdout;
  #editor: Editor | null = null;

  #busy: boolean;

  check_result: Result | null;
  eval_result: Result | null;

  diagnostics: EditorDiagnostic[] = $state([]);

  purepy_version: string;
  purepy_tag: string;

  constructor(files: NonEmpty<StaticFile>, active_index = 0) {
    this.#fs = new FileSystem(files, active_index);

    this.#stdout = new Stdout();

    this.#busy = $state(true);

    this.check_result = $state(null);
    this.eval_result = $state(null);

    // Known at build time from the bundled pure-py-spec submodule.
    this.purepy_version = $state(PUREPY_VERSION);
    this.purepy_tag = $state(PUREPY_TAG);
  }

  static default = () => {
    return new State(to_nonempty(example_files));
  };

  static from = (state: SharableState) => {
    const active = state.active ?? 0;

    return new State(
      state.files,
      Math.max(0, Math.min(active, state.files.length - 1)),
    );
  };

  get busy() {
    return this.#busy;
  }

  get stdout() {
    return this.#stdout;
  }

  get current_file(): string | null {
    return this.#fs.files[this.#fs.active_fd]?.path ?? null;
  }

  get fs() {
    return {
      files: this.#fs.files,
      dirty: this.#fs.dirty,
      new: this.#fs.new,
      open: this.#fs.open,
      active_fd: this.#fs.active_fd,
      remove: this.#fs.remove,
      rename: this.#fs.rename,
      save_all: this.#fs.save_all,
    };
  }

  get buffer() {
    return this.#fs.buffer;
  }

  set buffer(data: string) {
    this.#fs.buffer = data;
  }

  register_editor = once((editor: Editor) => {
    this.#editor = editor;

    editor.set_doc(this.#fs.buffer);
    this.refresh_editor_diagnostics();

    this.#fs.add_hook("open", (file) => {
      editor.set_doc(file.buffer);
      this.refresh_editor_diagnostics();
    });
  });

  register_purepy = once((purepy: PurePy) => {
    this.#purepy = purepy;

    this.purepy_version = purepy.version;
    this.purepy_tag = purepy.tag;

    this.#fs.for_each(purepy.write_file);
    this.#fs.add_hook("write", purepy.write_file);
    this.#fs.add_hook("delete", purepy.delete_file);
    this.#fs.add_hook("rename", purepy.rename_file);

    this.#busy = false;
  });

  #invalidate = () => {
    this.check_result = null;
    this.eval_result = null;
  };

  #check_file = (
    purepy: PurePy,
    fd: number,
  ): {
    diagnostics: EditorDiagnostic[];
    message: string;
    success: boolean;
  } => {
    const file = this.#fs.file(fd);

    const result = purepy.parse_and_check(file);

    const diagnostics = result.success
      ? []
      : result.errors.map((error) => ({
          file: error.file ?? null,
          line: error.line ?? null,
          col: error.col ?? null,
          message: error.msg,
        }));

    return {
      diagnostics,
      message: result.message,
      success: result.success,
    };
  };

  #check = (purepy: PurePy) => {
    const start = Date.now();

    // Check every open file exactly once.
    const results = this.#fs.files.map((_, fd) => this.#check_file(purepy, fd));

    const all_diagnostics = results.flatMap((result) => result.diagnostics);

    const active_fd = this.#fs.active_fd;
    const active_result = results[active_fd];

    const time = Date.now() - start;

    // Store one entry per unique diagnostic across all files.
    this.diagnostics = all_diagnostics.filter(
      (diagnostic, index, all) =>
        all.findIndex(
          (other) =>
            other.file === diagnostic.file &&
            other.line === diagnostic.line &&
            other.col === diagnostic.col &&
            other.message === diagnostic.message,
        ) === index,
    );

    const error = active_result.diagnostics[0] ?? null;

    if (error !== null) {
      const structured_error = {
        file: error.file,
        msg: error.message,
        line: error.line,
        col: error.col,
      };

      console.error("Check failed:", structured_error);
      console.error(JSON.stringify(structured_error));
    }

    this.refresh_editor_diagnostics();

    this.check_result = {
      success: active_result.success,
      time,
    };

    return {
      success: active_result.success,
      message: active_result.message,
    };
  };

  refresh_editor_diagnostics = () => {
    const active_file = this.current_file;

    if (active_file === null) {
      this.#editor?.set_diagnostics([]);
      return;
    }

    this.#editor?.set_diagnostics(
      this.diagnostics.filter((diagnostic) => diagnostic.file === active_file),
    );
  };

  #statefully = (fn: (purepy: PurePy) => void) => {
    if (this.busy || this.#purepy === null) {
      return;
    }
    this.#busy = true;
    this.#fs.save(this.#fs.active_fd);
    this.#invalidate();
    try {
      fn(this.#purepy);
    } catch (error) {
      console.error(error);
    } finally {
      this.#busy = false;
    }
  };

  save_and_check = () =>
    this.#statefully((purepy) => {
      this.#check(purepy);
    });

  save_and_run = () =>
    this.#statefully((purepy) => {
      const start = new SvelteDate();

      const result = this.#check(purepy);

      if (!result.success) {
        return;
      }

      this.#stdout.write_header(`Run · ${start.toLocaleTimeString()}`);

      const run_start = Date.now();

      const output_start = this.#stdout.lines.length;

      const { success, output } = purepy.evaluate(
        this.#fs.file(this.#fs.active_fd),
      );

      const time = Date.now() - run_start;

      this.eval_result = { success, time };

      if (!success) {
        this.#stdout.remove_last();
        return;
      }

      const streamed_output = this.#stdout.lines
        .slice(output_start)
        .some((line) => line.kind === "output");

      const returned_output =
        output !== undefined && output !== null && output !== "";

      if (!streamed_output && !returned_output) {
        this.#stdout.write_muted("(no output)");
        return;
      }

      if (!streamed_output && returned_output) {
        this.#stdout.write(
          typeof output === "object" ? JSON.stringify(output) : `${output}`,
        );
      }
    });

  serialise = () => {
    return {
      files: this.#fs.serialise(),
      active: this.#fs.active_fd,
    } as const;
  };
}
