// TODO: something more sensible
export type Status = {
  has_unsaved_changes: boolean;
  check_success: boolean | null;
  eval_success: boolean | null;
  check_time: number;
  eval_time: number;
};
