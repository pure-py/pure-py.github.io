<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import CodeMirror from "$lib/playground/components/Editor.svelte";
  import StatusBar from "$lib/playground/components/StatusBar.svelte";
  import Terminal from "$lib/playground/components/Terminal.svelte";
  import TerminalDragger from "$lib/playground/components/TerminalDragger.svelte";
  import Toolbar from "$lib/playground/components/Toolbar.svelte";
  import { PurePy } from "$lib/playground/lib/purepy";
  import { url_with_params_from_src } from "$lib/playground/lib/share";
  import { Stdout } from "$lib/playground/lib/stdout.svelte";
  import { onMount } from "svelte";
  import Tabs from "./components/Tabs.svelte";
  import { State } from "./lib/app.svelte";

  let { app }: { app: State } = $props();

  let terminalHeight: number | undefined = $state(undefined);

  let stdout = new Stdout();
  let purepy: PurePy | undefined = undefined;
  let editor: CodeMirror;

  // TODO: once we are happy we have all the state we need,
  // we should simplify this!!

  let check_success: boolean | null = $state(null);
  let eval_success: boolean | null = $state(null);

  let check_time = $state(0);
  let eval_time = $state(0);

  const status = $derived({
    has_unsaved_changes: app.dirty,
    check_success,
    eval_success,
    check_time,
    eval_time,
  });

  const save = () => {
    if (!app.active_file.dirty) {
      // nothing to do...
      return;
    }
    app.save_open_file();
    check_success = null;
    eval_success = null;
  };

  const share = async () => {
    try {
      save();
      const url = await url_with_params_from_src(
        page.url,
        app.active_file.data,
      );
      // update the url without reloading page
      const update_url = goto(url);
      // TODO: add visual feedback
      const copy_to_clipboard = navigator.clipboard.writeText(url.toString());

      await Promise.all([update_url, copy_to_clipboard]);
    } catch (error) {
      console.error(error);
    }
  };

  // don't use this unless you are inside a `statefully` already
  const _check_saved = (purepy: PurePy) => {
    const start_t = Date.now();
    const { success, error } = purepy.parse_and_check(app.active_file);
    check_time = Date.now() - start_t;
    check_success = success;
    if (!success) {
      stdout.write_err(error.msg);
    }
    return success;
  };

  const check = () =>
    app.statefully((purepy) => {
      save();
      const success = _check_saved(purepy);
      stdout.write(success ? `Check ok!` : `Check failed!`);
    });

  const run = () =>
    app.statefully((purepy) => {
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
      const { success, output } = purepy.evaluate(app.active_file);
      eval_time = Date.now() - start_t;
      eval_success = success;

      stdout.write("--- result ---");

      // if the program ends in a value expression, we get that
      // value here (otherwise undefined)
      const result = output === undefined ? "<no result>" : output;
      // TODO: figure out the possible, sensible output types and handle them properly,
      // in the meantime at least avoid [object Object]
      stdout.write(
        typeof result === "object" ? JSON.stringify(result) : `${result}`,
      );

      stdout.write("---");
    });

  const setup_codemirror = async () => {
    await editor.ready;
  };

  const setup_pyodide = async () => {
    stdout.write("Loading PurePy...");
    purepy = await PurePy.load();
    purepy.attach_stdout(stdout);
    app.register_purepy(purepy);
    stdout.write("Ready");
    stdout.write("Press Cmd/Ctrl + S or use the button below to run");
  };

  onMount(async () => {
    await Promise.all([setup_codemirror(), setup_pyodide()]);
  });

  const onkeydown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault();
      run();
    }
  };
</script>

<svelte:window {onkeydown} />

<div class="w-full h-full flex flex-col bg-zinc-900 overflow-clip">
  <div class="shrink-0 grow-0 flex flex-col">
    <Toolbar {share} {check} {run} is_busy={app.busy} />
    <Tabs {app} />
  </div>

  <div class="h-auto grow shrink">
    <CodeMirror bind:this={editor} {app} />
  </div>

  <div class="shrink-0 grow-0 flex flex-col">
    <TerminalDragger setHeight={(height) => (terminalHeight = height)} />
    <StatusBar {status} />
    <Terminal {terminalHeight} {stdout} />
  </div>
</div>
