export type LineKind =
  "output" | "success" | "error" | "separator" | "header" | "muted";

export type Line = {
  content: string;
  kind: LineKind;
};

export class Stdout {
  lines = $state<Line[]>([]);

  write = (content: string) => {
    this.lines.push({ content, kind: "output" });
  };

  write_muted = (content: string) => {
    this.lines.push({ content, kind: "muted" });
  };

  write_success = (content: string) => {
    this.lines.push({ content, kind: "success" });
  };

  write_header = (content: string) => {
    this.lines.push({ content, kind: "header" });
  };

  write_err = (content: string) => {
    this.lines.push({ content, kind: "error" });
  };

  write_separator = () => {
    this.lines.push({ content: "", kind: "separator" });
  };

  remove_last = () => {
    this.lines.pop();
  };

  clear = () => {
    this.lines = [];
  };
}
