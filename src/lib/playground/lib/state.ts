// TODO: something more sensible
export type Status = {
  has_unsaved_changes: boolean;
  check_success: boolean | null;
  eval_success: boolean | null;
  is_running_check: boolean;
  is_running_evaluate: boolean;
  is_pyodide_ready: boolean;
  is_codemirror_ready: boolean;
  check_time: number;
  eval_time: number;
};
