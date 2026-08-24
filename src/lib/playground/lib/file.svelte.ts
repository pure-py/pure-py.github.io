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

export class _File {
  private _dirty: boolean;
  private _data: string;
  private _buffer: string;

  readonly meta: ReadonlyFile;

  constructor(path: string, data: string) {
    this._data = $state(data);
    this._buffer = $state(data);
    this._dirty = $state(false);

    this.meta = $derived({
      path,
      data: this._data,
      buffer: this._buffer,
      dirty: this._dirty,
    });
  }

  save = () => {
    this._data = this._buffer;
    this._dirty = false;
  };

  get_data = () => {
    return this._data;
  };

  get_buffer = () => {
    return this._buffer;
  };

  set_buffer = (data: string) => {
    this._buffer = data;
    this._dirty = this._buffer !== this._data;
  };
}
