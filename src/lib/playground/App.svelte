<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import main_py from "$lib/assets/examples/example.py?raw";
  import other_py from "$lib/assets/examples/other.py?raw";
  import CodeMirror from "$lib/playground/components/Editor.svelte";
  import StatusBar from "$lib/playground/components/StatusBar.svelte";
  import Terminal from "$lib/playground/components/Terminal.svelte";
  import TerminalDragger from "$lib/playground/components/TerminalDragger.svelte";
  import Toolbar from "$lib/playground/components/Toolbar.svelte";
  import { PurePy } from "$lib/playground/lib/purepy";
  import {
    params_from_url,
    src_from_params,
    url_with_params_from_src,
  } from "$lib/playground/lib/share";
  import { Stdout } from "$lib/playground/lib/stdout.svelte";
  import { onMount } from "svelte";
  import Tabs from "./components/Tabs.svelte";
  import { File } from "./lib/app.svelte";

  let files: File[] = $state([
    new File("main.py", main_py),
    new File("other.py", other_py),
  ]);

  let active = $state(0);
  let active_file = $derived(files[active]);

  let terminalHeight: number | undefined = $state(undefined);

  let stdout = new Stdout();
  let purepy: PurePy | undefined = undefined;
  let editor: CodeMirror;

  // TODO: once we are happy we have all the state we need,
  // we should simplify this!!

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
    has_unsaved_changes: active_file.dirty,
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
    if (!active_file.dirty) {
      // nothing to do...
      return;
    }

    active_file.save();

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

  const share = async () => {
    is_running = true;
    try {
      save();
      const url = await url_with_params_from_src(
        page.url,
        active_file.get_data(),
      );

      // update the url without reloading page
      const update_url = goto(url);
      // TODO: add visual feedback
      const copy_to_clipboard = navigator.clipboard.writeText(url.toString());

      await Promise.all([update_url, copy_to_clipboard]);
    } catch (error) {
      console.error(error);
    } finally {
      is_running = false;
    }
  };

  // don't use this unless you are inside a `statefully` already
  const _check_saved = (purepy: PurePy) => {
    const start_t = Date.now();
    const { success, error } = purepy.parse_and_check(active_file.get_data());
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
      const { success, output } = purepy.evaluate(active_file.get_data());
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

  const set_active = async (index: number) => {
    active = index;
    await editor.set_doc(active_file.get_data());
  };

  const add_file = async (path: string) => {
    files.push(new File(path));
    active = files.length - 1;

    await editor.set_doc("");
  };

  const remove_file = (index: number) => {
    if (files.length === 1) {
      // never
      return;
    }

    if (index === files.length - 1) {
      active = index - 1;
    }

    files.splice(index, 1);
    editor.set_doc(active_file.get_data());
  };

  const setup_codemirror = async () => {
    const state = params_from_url(page.url);
    if (state === null) {
      await editor.set_doc(active_file.get_buffer());
    } else {
      try {
        const src = await src_from_params(state);
        active_file.set_buffer(src);
        active_file.save();
        await editor.set_doc(src);
      } catch (error) {
        console.error(error);
      }
    }

    is_codemirror_ready = true;
  };

  const setup_pyodide = async () => {
    stdout.write("Loading PurePy...");
    purepy = await PurePy.load();
    purepy.attach_stdout(stdout);
    is_pyodide_ready = true;
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

  const onupdate = (update: string) => {
    active_file.set_buffer(update);
  };
</script>

<svelte:window {onkeydown} />

<div class="w-full h-dvh max-h-screen flex flex-col bg-zinc-900 overflow-clip">
  <div class="shrink-0 grow-0 flex flex-col">
    <Toolbar {share} {check} {run} {is_busy} />
    <Tabs {active} {files} {set_active} {add_file} {remove_file} />
  </div>

  <div class="h-auto grow shrink">
    <CodeMirror bind:this={editor} initial_value="" {onupdate} />
  </div>

  <div class="shrink-0 grow-0 flex flex-col">
    <TerminalDragger setHeight={(height) => (terminalHeight = height)} />
    <StatusBar {status} />
    <Terminal {terminalHeight} {stdout} />
  </div>
</div>
