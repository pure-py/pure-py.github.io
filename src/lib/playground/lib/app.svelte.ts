import main_py from "$lib/assets/examples/example.py?raw";
import other_py from "$lib/assets/examples/other.py?raw";
import type { PurePy } from "./purepy";
import { _File, type StaticFile, type ReadonlyFile } from "./file.svelte";
import { nonempty_map, type NonEmpty } from "$lib/utils/non-empty";
import type { Stdout } from "./stdout.svelte";

type Editor = {
  set_doc: (str: string) => void;
};

export type Result = {
  success: boolean;
  time: number;
};

export class State {
  private _files: NonEmpty<_File>;
  readonly files: NonEmpty<ReadonlyFile>;

  private _active_file_index: number;
  private _active_file: _File;

  readonly active_file_index: number;
  readonly active_file: ReadonlyFile;

  // these are currently initialised elsewhere and not directly managed here
  editor: Editor | null = null;
  purepy: PurePy | null = null;
  stdout: Stdout | null = null;

  // state things
  readonly dirty: boolean;
  private _busy: boolean;
  readonly busy: boolean;

  check_result: Result | null;
  eval_result: Result | null;

  constructor(files: NonEmpty<StaticFile>) {
    this._files = $state(nonempty_map(files, (f) => new _File(f.path, f.data)));
    this.files = $derived(nonempty_map(this._files, (f) => f.meta));

    this._active_file_index = $state(0);
    this._active_file = $state(this._files[this._active_file_index]);
    this.active_file_index = $derived(this._active_file_index);
    this.active_file = $derived(this._active_file.meta);

    this.dirty = $derived(this.files.some((file) => file.dirty));
    this._busy = $state(true);
    this.busy = $derived(this._busy);

    this.check_result = $state(null);
    this.eval_result = $state(null);
  }

  static default = () => {
    return new State([
      { path: "main.py", data: main_py },
      { path: "other.py", data: other_py },
    ]);
  };

  // private get_file = (index: number) => {
  //   const file = this._files.at(index);
  //   if (file === undefined) {
  //     throw new Error("There is a bug in the file system.");
  //   }
  //   return file;
  // };

  new_file = (path: string) => {
    if (this._files.some((file) => file.meta.path === path)) {
      throw new Error("File already exists at this path");
    }
    this._files.push(new _File(path, ""));
    this.purepy?.write_file(path, "");
    this.open_file(this._files.length - 1);
  };

  // set the active file
  open_file = (index: number) => {
    if (index < 0 || index >= this._files.length) {
      throw new Error("Invalid file index");
    }
    this._active_file_index = index;
    this._active_file = this._files[index];
    this.editor?.set_doc(this._active_file.meta.buffer);
  };

  // save the active file
  save_open_file = () => {
    this._active_file.save();
    this.purepy?.write_file(
      this._active_file.meta.path,
      this._active_file.meta.data,
    );

    this.check_result = null;
    this.eval_result = null;
  };

  write_open_file = (data: string) => {
    this._active_file.set_buffer(data);
  };

  // delete the active file
  delete_open_file = () => {
    if (this.files.length === 1) {
      console.error("Tried to remove only file");
      return;
    }

    this._files.splice(this._active_file_index, 1);
    this.purepy?.delete_file(this._active_file.meta.path);
    this.open_file(
      this._active_file_index === this.files.length
        ? this._active_file_index - 1
        : this._active_file_index,
    );
  };

  register_editor = (editor: Editor) => {
    this.editor = editor;
    this.editor.set_doc(this._active_file.meta.buffer);

    if (this.purepy !== null) {
      this._busy = false;
    }
  };

  register_purepy = (purepy: PurePy) => {
    this.purepy = purepy;
    for (const file of this.files) {
      this.purepy.write_file(file.path, file.data);
    }

    if (this.editor !== null) {
      this._busy = false;
    }
  };

  register_stdout = (stdout: Stdout) => {
    this.stdout = stdout;
  };

  private statefully = (fn: (purepy: PurePy) => void) => {
    if (this.busy || this.purepy === null) {
      // never?
      return;
    }
    this._busy = true;
    try {
      fn(this.purepy);
    } catch (error) {
      console.error(error);
    } finally {
      this._busy = false;
    }
  };

  private _check = (purepy: PurePy) => {
    const start = Date.now();
    const { success, error } = purepy.parse_and_check(this.active_file);
    const time = Date.now() - start;
    if (!success) {
      this.stdout?.write_err(error.msg);
    }
    this.check_result = {
      success,
      time,
    };
    return success;
  };

  save_and_check = () =>
    this.statefully((purepy) => {
      this.save_open_file();
      const success = this._check(purepy);
      if (success) {
        this.stdout?.write("Check ok!");
      } else {
        this.stdout?.write_err("Check failed!");
      }
    });

  save_and_run = () =>
    this.statefully((purepy) => {
      this.save_open_file();
      const check_success = this._check(purepy);
      if (!check_success) {
        this.stdout?.write_err("Check failed, running anyway...");
      }

      this.stdout?.write("--- stdout ---");

      const start = Date.now();
      const { success, output } = purepy.evaluate(this.active_file);
      const time = Date.now() - start;
      this.eval_result = {
        success,
        time,
      };

      this.stdout?.write("--- result ---");

      // if the program ends in a value expression, we get that
      // value here (otherwise undefined)
      const result = output === undefined ? "<no result>" : output;
      // TODO: figure out the possible, sensible output types and handle them properly,
      // in the meantime at least avoid [object Object]
      this.stdout?.write(
        typeof result === "object" ? JSON.stringify(result) : `${result}`,
      );

      this.stdout?.write("---");
    });
}
