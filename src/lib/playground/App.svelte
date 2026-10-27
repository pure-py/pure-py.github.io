<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import CodeMirror from "#lib/playground/components/Editor.svelte";
  import StatusBar from "#lib/playground/components/StatusBar.svelte";
  import Terminal from "#lib/playground/components/Terminal.svelte";
  import TerminalDragger from "#lib/playground/components/TerminalDragger.svelte";
  import Toolbar from "#lib/playground/components/Toolbar.svelte";
  import Toaster, { toast } from "#lib/playground/components/Toaster.svelte";

  import { PUREPY_VERSION, PurePy } from "#lib/playground/lib/purepy.js";
  import { url_with_params_from_state } from "#lib/playground/lib/share.js";

  import { onMount } from "svelte";
  import Tabs from "./components/Tabs.svelte";
  import { State } from "./lib/app.svelte";

  let { app }: { app: State } = $props();

  const TOOLBAR_HEIGHT = 72;
  const STATUS_BAR_HEIGHT = 24 + 1; // status bar + dragger
  const DEFAULT_TERMINAL_HEIGHT = 128;

  let available_height = $state(0); // bind to window.innerHeight
  let toolbar_height = $state(TOOLBAR_HEIGHT);
  let terminal_height = $state(DEFAULT_TERMINAL_HEIGHT + STATUS_BAR_HEIGHT);
  let editor_height = $derived(
    Math.max(available_height - toolbar_height - terminal_height, 0),
  );

  const adjust_height = (client_y: number) => {
    const proposed_height = available_height - client_y;
    terminal_height = Math.max(proposed_height, STATUS_BAR_HEIGHT);
  };

  // let stdout = new Stdout();
  let purepy: PurePy | undefined = undefined;
  let editor: CodeMirror;

  const share = async () => {
    try {
      app.fs.save_all();
      const state = app.serialise();
      const url = await url_with_params_from_state(page.url, state);

      // update the url without reloading page
      const update_url = goto(url);
      const copy_to_clipboard = navigator.clipboard.writeText(url.toString());

      await Promise.all([update_url, copy_to_clipboard]);

      toast("Share link copied to clipboard");
    } catch (error) {
      console.error(error);

      toast(
        error instanceof Error ? error.message : "Could not create share link",
        "error",
      );
    }
  };

  const setup_codemirror = async () => {
    await editor.ready;
  };

  const setup_pyodide = async () => {
    toast(`Loading ${PUREPY_VERSION} …`);

    try {
      purepy = await PurePy.load();
      purepy.attach_stdout(app.stdout);
      app.register_purepy(purepy);

      toast("Ready—press", "success", {
        keys: ["⌘S"],
        action: "or use the button above to run",
      });
    } catch (error) {
      console.error(error);

      toast(
        error instanceof Error ? error.message : "Unexpected load error",
        "error",
      );
    }
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

<!-- Toolbar + Editor + Status Bar + Terminal (available_height) -->
<div
  bind:clientHeight={available_height}
  class="w-full min-h-full h-full max-h-full flex flex-col"
>
  <!-- Toolbar (TOOLBAR_HEIGHT) -->
  <div class="flex flex-col">
    <Toolbar
      {share}
      check={app.save_and_check}
      run={app.save_and_run}
      is_busy={app.busy}
    />
    <Tabs {app} />
  </div>

  <!-- Editor (editor_height) -->
  <div style="height: {editor_height}px">
    <CodeMirror bind:this={editor} {app} />
  </div>

  <!-- Status Bar + Terminal (terminal_height) -->
  <div class="flex flex-col" style="height: {terminal_height}px">
    <!-- Status Bar (STATUS_BAR_HEIGHT) -->
    <TerminalDragger ondrag={adjust_height} />
    <StatusBar
      dirty={app.fs.dirty}
      check_result={app.check_result}
      eval_result={app.eval_result}
    />
    <!-- Terminal -->
    <Terminal stdout={app.stdout} />
  </div>

  <Toaster />
</div>
