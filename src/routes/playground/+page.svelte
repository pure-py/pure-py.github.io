<script lang="ts">
  import example_py from "$lib/assets/examples/example.py?raw";
  import CodeMirror from "$lib/playground/Editor.svelte";
  import { PurePy } from "$lib/playground/lib/purepy";
  import { Stdout } from "$lib/playground/lib/stdout.svelte";
  import Terminal from "$lib/playground/Terminal.svelte";
  import TerminalDragger from "$lib/playground/TerminalDragger.svelte";
  import Toolbar from "$lib/playground/Toolbar.svelte";
  import { onMount } from "svelte";

  let terminalHeight: number | undefined = $state(undefined);

  let stdout = new Stdout();
  let purepy: PurePy | undefined = undefined;

  let src_saved: string = $state(example_py);
  let src_unsaved: string = $state(example_py);
  // let has_unsaved_changes = $derived<boolean>(src_saved !== src_unsaved);
  let is_running: boolean = $state(false);
  let is_ready: boolean = $state(false);

  // all of our actions are very fast, so it is okay to defer
  // 'saving' if an action is running, but we may want to change this
  // later.
  const statefully = (fn: (purepy: PurePy) => void) => {
    if (is_running || !is_ready || purepy === undefined) {
      console.error("I'm in a bad state...");
      return;
    }
    is_running = true;
    src_saved = src_unsaved;
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

  const check = () =>
    statefully((purepy) => {
      const result = purepy.parse_and_check(src_saved);

      if (!result.success) {
        stdout.write_err(result.error.msg);
        return;
      }

      stdout.write(`Check ok!`);
    });

  const run = () =>
    statefully((purepy) => {
      const result = purepy.evaluate(src_saved);

      if (!result.success) {
        stdout.write_err(result.error.msg);
        return;
      }

      stdout.write(`Result: ${result.output}`);
    });

  onMount(async () => {
    stdout.write("Loading PurePy...");
    purepy = await PurePy.load();
    purepy.attach_stdout(stdout);
    is_ready = true;
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
    <Toolbar {check} {run} {is_running} />
  </div>

  <div class="h-full">
    <CodeMirror value={example_py} {onupdate} />
  </div>

  <div class="shrink-0 grow-0 flex flex-col">
    <TerminalDragger setHeight={(height) => (terminalHeight = height)} />
    <Terminal {terminalHeight} {stdout} />
  </div>
</div>
