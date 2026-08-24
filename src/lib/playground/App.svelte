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

  const share = async () => {
    try {
      app.save_open_file();
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
      app.save_and_run();
    }
  };
</script>

<svelte:window {onkeydown} />

<div class="w-full h-full flex flex-col bg-zinc-900 overflow-clip">
  <div class="shrink-0 grow-0 flex flex-col">
    <Toolbar
      {share}
      check={app.save_and_check}
      run={app.save_and_run}
      is_busy={app.busy}
    />
    <Tabs {app} />
  </div>

  <div class="h-auto grow shrink">
    <CodeMirror bind:this={editor} {app} />
  </div>

  <div class="shrink-0 grow-0 flex flex-col">
    <TerminalDragger setHeight={(height) => (terminalHeight = height)} />
    <StatusBar
      dirty={app.dirty}
      check_result={app.check_result}
      eval_result={app.eval_result}
    />
    <Terminal {terminalHeight} {stdout} />
  </div>
</div>
