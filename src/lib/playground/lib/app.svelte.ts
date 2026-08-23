import main_py from "$lib/assets/examples/example.py?raw";
import other_py from "$lib/assets/examples/other.py?raw";
import type { PurePy } from "./purepy";
import { File } from "./file.svelte";

type Editor = {
  set_doc: (str: string) => void;
};

export class State {
  files: [File, ...File[]];
  active_file_index: number;
  active_file: File;

  // we get these later
  editor: Editor | null = null;
  purepy: PurePy | null = null;

  // state things
  readonly dirty: boolean;
  private _busy: boolean;
  readonly busy: boolean;

  constructor(files: [File, ...File[]]) {
    this.files = $state([...files]);
    this.active_file_index = $state(0);
    this.active_file = $derived(this.files[this.active_file_index]);

    this.dirty = $derived(this.files.some((file) => file.dirty));
    this._busy = $state(true);
    this.busy = $derived(this._busy);
  }

  static default = () => {
    return new State([
      new File("main.py", main_py),
      new File("other.py", other_py),
    ]);
  };

  add_file = (path: string) => {
    this.files.push(new File(path));
    this.purepy?.write_file(path, "");

    this.set_active(this.files.length - 1);
  };

  remove_file = (index: number) => {
    if (this.files.length === 1) {
      console.error("Tried to remove only file");
      return;
    }

    const file = this.files.at(index);

    if (file === undefined) {
      // never?
      return;
    }

    const is_last = this.active_file_index === this.files.length - 1;

    this.files.splice(index, 1);
    this.purepy?.delete_file(file.path);
    this.set_active(
      is_last ? this.active_file_index - 1 : this.active_file_index,
    );
  };

  set_active = (index: number) => {
    this.active_file_index = index;
    this.editor?.set_doc(this.active_file.get_buffer());
  };

  register_editor = (editor: Editor) => {
    this.editor = editor;
    this.editor.set_doc(this.active_file.get_buffer());

    console.log("editor done");
    if (this.purepy !== null) {
      console.log("not busy!");
      this._busy = false;
    }
  };

  register_purepy = (purepy: PurePy) => {
    this.purepy = purepy;
    for (const file of this.files) {
      this.purepy.write_file(file.path, file.get_data());
    }

    console.log("purepy done");
    if (this.editor !== null) {
      console.log("not busy!");

      this._busy = false;
    }
  };

  statefully = (fn: (purepy: PurePy) => void) => {
    if (this.busy || this.purepy === null) {
      // never?
      console.error("Busy!");
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
}
