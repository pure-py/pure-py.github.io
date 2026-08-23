import main_py from "$lib/assets/examples/example.py?raw";
import other_py from "$lib/assets/examples/other.py?raw";
import { type NonEmpty } from "$lib/utils/non-empty";
import { once } from "$lib/utils/once";
import { type StaticFile, FileSystem } from "./file.svelte";
import type { PurePy } from "./purepy";
import type { SharableState } from "./share/codec";
import { Stdout } from "./stdout.svelte";

type Editor = {
  set_doc: (str: string) => void;
};

export type Result = {
  success: boolean;
  time: number;
};

export class State {
  #fs: FileSystem;
  #purepy: PurePy | null = null;
  #stdout: Stdout;

  #busy: boolean;

  check_result: Result | null;
  eval_result: Result | null;

  constructor(files: NonEmpty<StaticFile>, active_index = 0) {
    this.#fs = new FileSystem(files, active_index);

    this.#stdout = new Stdout();

    this.#busy = $state(true);

    this.check_result = $state(null);
    this.eval_result = $state(null);
  }

  static default = () => {
    return new State([
      { path: "main.py", data: main_py },
      { path: "other.py", data: other_py },
    ]);
  };

  static from = (state: SharableState) => {
    return new State(
      state.files,
      Math.min(state.active ?? 0, state.files.length),
    );
  };

  get busy() {
    return this.#busy;
  }

  get stdout() {
    return this.#stdout;
  }

  // its not clear to me if these lose reactivity by returning like this
  // that was certainly the case for fs.buffer
  get fs() {
    return {
      files: this.#fs.files,
      dirty: this.#fs.dirty,
      new: this.#fs.new,
      open: this.#fs.open,
      active_fd: this.#fs.active_fd,
      remove: this.#fs.remove,
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
    editor.set_doc(this.#fs.buffer);
    this.#fs.add_hook("open", (file) => editor.set_doc(file.buffer));
  });

  register_purepy = once((purepy: PurePy) => {
    this.#purepy = purepy;
    this.#fs.for_each(purepy.write_file);
    this.#fs.add_hook("write", purepy.write_file);
    this.#fs.add_hook("delete", purepy.delete_file);
    this.#busy = false;
  });

  #invalidate = () => {
    this.check_result = null;
    this.eval_result = null;
  };

  #check = (purepy: PurePy) => {
    const start = Date.now();
    const { success, error } = purepy.parse_and_check(
      this.#fs.file(this.#fs.active_fd),
    );
    const time = Date.now() - start;
    if (!success) {
      this.#stdout?.write_err(error.msg);
    }
    this.check_result = {
      success,
      time,
    };
    return success;
  };

  // just a helper for common parts of `save_and_check` and
  // `save_and_run`
  #statefully = (fn: (purepy: PurePy) => void) => {
    if (this.busy || this.#purepy === null) {
      // never?
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
      const success = this.#check(purepy);
      if (success) {
        this.#stdout?.write("Check ok!");
      } else {
        this.#stdout?.write_err("Check failed!");
      }
    });

  save_and_run = () =>
    this.#statefully((purepy) => {
      const check_success = this.#check(purepy);
      if (!check_success) {
        this.#stdout?.write_err("Check failed, running anyway...");
      }

      this.#stdout?.write("--- stdout ---");

      const start = Date.now();
      const { success, output } = purepy.evaluate(
        this.#fs.file(this.#fs.active_fd),
      );
      const time = Date.now() - start;
      this.eval_result = {
        success,
        time,
      };

      this.#stdout?.write("--- result ---");

      // if the program ends in a value expression, we get that
      // value here (otherwise undefined)
      const result = output === undefined ? "<no result>" : output;
      // TODO: figure out the possible, sensible output types and handle them properly,
      // in the meantime at least avoid [object Object]
      this.#stdout?.write(
        typeof result === "object" ? JSON.stringify(result) : `${result}`,
      );

      this.#stdout?.write("---");
    });

  serialise = () => {
    return {
      files: this.#fs.serialise(),
      active: this.#fs.active_fd,
    } as const;
  };
}
