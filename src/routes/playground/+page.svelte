<script lang="ts">
  import example_py from "$lib/assets/examples/example.py?raw";
  import CodeMirror from "./Editor.svelte";
  import { PurePy } from "./purepy";
  import { Stdout } from "./stdout.svelte";
  import { onMount } from "svelte";

  let stdout = new Stdout();
  let purepy: PurePy | undefined = undefined;

  let src_saved = $state<string | null>(null);
  let src_unsaved = $state<string>(example_py);
  // let has_unsaved_changes = $derived<boolean>(src_saved !== src_unsaved);
  let is_running = $state<boolean>(false);
  let is_ready = $state<boolean>(false);

  const save_and_run = async () => {
    if (is_running || !is_ready || purepy === undefined) {
      return;
    }
    is_running = true;
    src_saved = src_unsaved;

    try {
      const result = purepy.evaluate(src_saved);

      if (!result.success) {
        stdout.write_err(result.error.msg);
        return;
      }

      stdout.write(`Result: ${result.output}`);
    } finally {
      is_running = false;
    }
  };

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
      save_and_run();
    }
  };

  const onupdate = (update: string) => {
    src_unsaved = update;
  };
</script>

<svelte:window {onkeydown} />

<div style="height: 100%; width: 100%; display: flex">
  <div style="width: 100%">
    <CodeMirror value={example_py} {onupdate} />
  </div>
  <div style="width: 100%">
    <div style="height:100%; width:100%; font-family: monospace; padding: 8px;">
      {#each $state.eager(stdout.lines) as line, index (index)}
        <p
          style="white-space: pre; margin: 0; color: {line.is_err
            ? 'red'
            : 'black'}"
        >
          {line.content}
        </p>
      {/each}
    </div>
    {#if is_ready && !is_running}
      <button onclick={save_and_run} disabled={is_running}>Run</button>
    {/if}
    <button onclick={stdout.clear}>Clear</button>
  </div>
</div>
