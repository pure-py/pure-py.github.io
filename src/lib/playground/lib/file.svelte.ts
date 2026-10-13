import { validate_filename } from "./paths";
import { nonempty_map, type NonEmpty } from "$lib/utils/non-empty";

export type StaticFile = {
  readonly path: string;
  readonly data: string;
};

export type ReadonlyFile = {
  readonly path: string;
  readonly data: string;
  readonly buffer: string;
  readonly dirty: boolean;
};

export class File {
  #path: string;
  #data: string;
  #buffer: string;
  #dirty: boolean;

  readonly info: ReadonlyFile;

  constructor(path: string, data: string) {
    validate_filename(path);

    this.#path = $state(path);
    this.#data = $state(data);
    this.#buffer = $state(data);
    this.#dirty = $state(false);

    this.info = $derived({
      path: this.#path,
      data: this.#data,
      buffer: this.#buffer,
      dirty: this.#dirty,
    });
  }

  rename = (path: string) => {
    validate_filename(path);
    this.#path = path;
  };

  get buffer() {
    return this.#buffer;
  }

  set buffer(data: string) {
    this.#buffer = data;
    this.#dirty = this.#buffer !== this.#data;
  }

  save = () => {
    this.#data = this.#buffer;
    this.#dirty = false;
  };

  serialise = () => {
    return {
      path: this.info.path,
      data: this.info.data,
    } as const;
  };
}

export type FileHook = (file: ReadonlyFile) => void;
export type FileEvent = "open" | "write" | "delete";

export class FileSystem {
  #files: NonEmpty<File>;
  #hooks: Record<FileEvent, FileHook[]>;

  #active_fd: number;
  #active_file: File;

  constructor(files: NonEmpty<StaticFile>, active_index: number) {
    this.#files = $state(nonempty_map(files, (f) => new File(f.path, f.data)));
    this.#hooks = { open: [], write: [], delete: [] };
    this.#active_fd = $state(active_index);
    this.#active_file = $derived(this.#file(this.#active_fd));
  }

  #file = (fd: number) => {
    const file = this.#files[fd];
    if (file === undefined) {
      throw new Error("Index out of bounds");
    }
    return file;
  };

  file = (fd: number) => {
    const file = this.#file(fd);
    return file.info;
  };

  get active_fd() {
    return this.#active_fd;
  }

  get files() {
    return nonempty_map(this.#files, (f) => f.info);
  }

  get dirty() {
    return this.files.some((file) => file.dirty);
  }

  get buffer() {
    return this.#active_file.buffer;
  }

  set buffer(data: string) {
    this.#active_file.buffer = data;
  }

  add_hook = (event: FileEvent, hook: FileHook) => {
    this.#hooks[event].push(hook);
  };

  run_hooks = (event: FileEvent, file: ReadonlyFile) => {
    this.#hooks[event].forEach((hook) => hook(file));
  };

  for_each = (fn: (file: ReadonlyFile, index: number) => void) => {
    this.files.forEach((file, index) => fn(file, index));
  };

  count = () => {
    return this.#files.length;
  };

  last_index = () => {
    return this.count() - 1;
  };

  // Path methods

  exists = (path: string) => {
    return this.#files.some((file) => file.info.path === path);
  };

  new = (path: string): ReadonlyFile => {
    validate_filename(path);

    if (this.exists(path)) {
      throw new Error("File already exists at this path");
    }

    const file = new File(path, "");
    this.#files.push(file);
    this.run_hooks("write", file.info);
    return this.open(this.last_index());
  };

  rename = (fd: number, new_path: string): ReadonlyFile => {
    validate_filename(new_path);

    const file = this.#file(fd);

    if (file.info.path === new_path) {
      return file.info;
    }

    if (this.exists(new_path)) {
      throw new Error("File already exists at this path");
    }

    const old_file = file.info;

    file.rename(new_path);

    // Remove the old path from Pyodide, then write the renamed file to its
    // new path using the existing filesystem hooks.
    this.run_hooks("delete", old_file);
    this.run_hooks("write", file.info);

    return file.info;
  };

  // Index methods

  open = (fd: number): ReadonlyFile => {
    const file = this.#file(fd);
    this.#active_fd = fd;
    this.run_hooks("open", file.info);
    return file.info;
  };

  save = (fd: number): ReadonlyFile => {
    const file = this.#file(fd);
    if (file.info.dirty) {
      file.save();
      this.run_hooks("write", file.info);
    }
    return file.info;
  };

  remove = (fd: number): ReadonlyFile => {
    if (this.files.length === 1) {
      throw new Error("Attempted to delete only file.");
    }

    const file = this.#file(fd);

    const is_active = fd === this.#active_fd;
    const is_last = fd === this.last_index();

    this.#files.splice(fd, 1);

    this.run_hooks("delete", file.info);

    // Keep the active index valid:
    // - removing a file before the active file shifts later indices left
    // - removing the active file selects a neighbouring file
    if (fd < this.#active_fd) {
      this.#active_fd -= 1;
    } else if (is_active) {
      this.open(is_last ? fd - 1 : fd);
    }

    return file.info;
  };

  // for all files

  save_all = () => {
    this.for_each((_, index) => this.save(index));
  };

  // Operate on the open file

  save_active = () => {
    this.save(this.#active_fd);
  };

  serialise = () => {
    return nonempty_map(this.#files, (f) => f.serialise());
  };
}
