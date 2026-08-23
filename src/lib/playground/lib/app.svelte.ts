export class File {
  readonly path: string;
  private data: string;
  private buffer: string;
  readonly dirty: boolean;

  constructor(path: string, data?: string) {
    this.path = $state(path);
    this.data = $state(data ?? "");
    this.buffer = $state(data ?? "");
    this.dirty = $derived(this.data !== this.buffer);
  }

  save = () => {
    this.data = this.buffer;
  };

  get_data = () => {
    return this.data;
  };

  get_buffer = () => {
    return this.buffer;
  };

  set_buffer = (data: string) => {
    this.buffer = data;
  };
}
