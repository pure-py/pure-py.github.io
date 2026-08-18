<script lang="ts">
  import example_py from "$lib/assets/examples/example.py?raw";
  import CodeMirror from "./Editor.svelte";
  import { PurePy } from "./purepy";
  import { Stdout } from "./stdout.svelte";
  import { onMount } from "svelte";

  let terminalHeight = $state<number>(undefined);
  let totalHeight = $state<number>(undefined);

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

  const onmousedown = () => {
    const mousemove = (e) => {
      terminalHeight = innerHeight - e.clientY - 2;
    };

    const mouseup = () => {
      window.removeEventListener("mouseup", mouseup);
      window.removeEventListener("mousemove", mousemove);
    };

    window.addEventListener("mouseup", mouseup);
    window.addEventListener("mousemove", mousemove);
  };

  const onupdate = (update: string) => {
    src_unsaved = update;
  };
</script>

<svelte:window {onkeydown} bind:innerHeight={totalHeight} />

<div
  class="w-full h-dvh max-h-screen flex flex-col justify-between bg-zinc-900 overflow-clip"
>
  <div>
    <button
      type="button"
      class="inline-flex items-baseline gap-x-1.5 px-2.5 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-zinc-700"
    >
      Check
    </button>

    <button
      type="button"
      class="inline-flex items-baseline gap-x-1.5 px-2.5 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-zinc-700"
    >
      Run
      <div class=" border-gray-500 border px-1 rounded-sm text-xs font-normal">
        ⌘+S
      </div>
    </button>
  </div>

  <div class="h-full w-full bg-red-100">
    <CodeMirror value={example_py} {onupdate} />
  </div>

  <div class="">
    <div
      {onmousedown}
      class="h-4 border-white border-t w-full m-auto cursor-row-resize hover:bg-zinc-800"
    ></div>

    <div
      bind:clientHeight={terminalHeight}
      class="w-full h-full min-h-24 overflow-scroll"
      style="height: {terminalHeight}px"
    >
      <div class="h-full w-full font-mono p-2">
        {#each $state.eager(stdout.lines) as line, index (index)}
          <p
            class="whitespace-pre m-0 {line.is_err
              ? 'text-red-500'
              : 'text-white'}"
          >
            {line.content}
          </p>
        {/each}
      </div>
    </div>
  </div>
</div>
