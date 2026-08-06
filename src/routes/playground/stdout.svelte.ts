export type Line = {
  content: string;
  is_err: boolean;
};

export class Stdout {
  lines = $state<Line[]>([]);

  write = (str: string) => {
    this.lines.push({ content: str, is_err: false });
  };

  write_err = (str: string) => {
    this.lines.push({ content: str, is_err: true });
  };

  clear = () => {
    this.lines = [];
  };
}
