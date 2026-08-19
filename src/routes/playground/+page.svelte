<script lang="ts">
  import example_py from "$lib/assets/examples/example.py?raw";
  import CodeMirror from "$lib/playground/Editor.svelte";
  import { PurePy } from "$lib/playground/lib/purepy";
  import { Stdout } from "$lib/playground/lib/stdout.svelte";
  import StatusBar from "$lib/playground/StatusBar.svelte";
  import Terminal from "$lib/playground/Terminal.svelte";
  import TerminalDragger from "$lib/playground/TerminalDragger.svelte";
  import Toolbar from "$lib/playground/Toolbar.svelte";
  import { onMount } from "svelte";

  let terminalHeight: number | undefined = $state(undefined);

  let stdout = new Stdout();
  let purepy: PurePy | undefined = undefined;

  // TODO: once we are happy we have all the state we need,
  // we should simplify this!!

  let src_saved = $state(example_py);
  let src_unsaved = $state(example_py);
  let has_unsaved_changes = $derived(src_saved !== src_unsaved);

  let is_running_check = $state(false);
  let is_running_evaluate = $state(false);
  let is_running = $derived(is_running_check || is_running_evaluate);

  let is_pyodide_ready = $state(false);
  let is_codemirror_ready = $state(false);
  let is_busy = $derived(
    !is_pyodide_ready || !is_codemirror_ready || is_running,
  );

  let check_success: boolean | null = $state(null);
  let eval_success: boolean | null = $state(null);

  let check_time = $state(0);
  let eval_time = $state(0);

  const status = $derived({
    has_unsaved_changes,
    check_success,
    eval_success,
    is_running_check,
    is_running_evaluate,
    is_pyodide_ready,
    is_codemirror_ready,
    check_time,
    eval_time,
  });

  const save = () => {
    if (!has_unsaved_changes) {
      // nothing to do...
      return;
    }
    src_saved = src_unsaved;
    check_success = null;
    eval_success = null;
  };

  // all of our actions are very fast, so it is okay to defer
  // 'saving' if an action is running, but we may want to change this
  // later.
  const statefully = (fn: (purepy: PurePy) => void) => {
    if (is_busy || purepy === undefined) {
      console.error("I'm in a bad state...");
      return;
    }
    is_running = true;
    try {
      fn(purepy);
    } catch (error) {
      // TODO: see what errors might come out of Pyodide and if/how we should handle
      // them, in the meantime, don't crash the page
      console.error(error);
    } finally {
      is_running = false;
    }
  };

  // don't use this unless you are inside a `statefully` already
  const _check_saved = (purepy: PurePy) => {
    const start_t = Date.now();
    const { success, error } = purepy.parse_and_check(src_saved);
    check_time = Date.now() - start_t;
    check_success = success;
    if (!success) {
      stdout.write_err(error.msg);
    }
    return success;
  };

  const check = () =>
    statefully((purepy) => {
      save();
      const success = _check_saved(purepy);
      stdout.write(success ? `Check ok!` : `Check failed!`);
    });

  const run = () =>
    statefully((purepy) => {
      save();
      const check_ok = _check_saved(purepy);
      if (!check_ok) {
        // what should we do here? should we even check here?
        // should we refuse to run?
        stdout.write("Check failed, running anyway:");
      }

      stdout.write("--- stdout ---");

      // TODO: this is always successful, but surely not,
      // we should catch runtime errors!
      const start_t = Date.now();
      const { success, output } = purepy.evaluate(src_saved);
      eval_time = Date.now() - start_t;
      eval_success = success;

      stdout.write("--- result ---");

      // if the program ends in a value expression, we get that
      // value here (otherwise undefined)
      const result = output === undefined ? "<no result>" : output;
      stdout.write(`${result}`);

      stdout.write("---");
    });

  onMount(async () => {
    stdout.write("Loading PurePy...");
    purepy = await PurePy.load();
    purepy.attach_stdout(stdout);
    is_pyodide_ready = true;
    stdout.write("Ready");
    stdout.write("Press Cmd/Ctrl + S or use the button below to run");
  });

  const onkeydown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault();
      run();
    }
  };

  const onupdate = (update: string) => {
    src_unsaved = update;
  };
</script>

<svelte:window {onkeydown} />

<div class="w-full h-dvh max-h-screen flex flex-col bg-zinc-900 overflow-clip">
  <div class="shrink-0 grow-0">
    <Toolbar {check} {run} {is_busy} />
  </div>

  <div class="h-auto grow shrink">
    <CodeMirror
      onload={() => (is_codemirror_ready = true)}
      value={example_py}
      {onupdate}
    />
  </div>

  <div class="shrink-0 grow-0 flex flex-col">
    <TerminalDragger setHeight={(height) => (terminalHeight = height)} />
    <StatusBar {status} />
    <Terminal {terminalHeight} {stdout} />
  </div>
</div>
