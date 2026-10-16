<script lang="ts">
  import { type Stdout } from "$lib/playground/lib/stdout.svelte";

  type Props = { terminalHeight: number | undefined; stdout: Stdout };
  let { terminalHeight, stdout }: Props = $props();

  const MIN_HEIGHT = 128;

  let height = $derived(terminalHeight ?? MIN_HEIGHT);

  let terminal: HTMLDivElement | undefined;

  $effect(() => {
    // Read the number of lines so this effect reruns whenever output changes.
    stdout.lines.length;

    requestAnimationFrame(() => {
      terminal?.scrollTo({
        top: terminal.scrollHeight,
        behavior: "smooth",
      });
    });
  });
</script>

<div
  bind:this={terminal}
  class="min-h-32 font-mono text-sm p-2 overflow-y-scroll overflow-x-clip"
  style="height: {height}px; min-height: {MIN_HEIGHT}px; max-height: {height}px;"
>
  {#each stdout.lines as line, index (`${index}-${line.content}`)}
    {#if line.kind === "separator"}
      <div class="my-4 border-t border-zinc-700"></div>
    {:else if line.kind === "header"}
      <div class="mt-6 mb-2 flex items-center gap-3">
        <div class="h-px grow bg-zinc-700"></div>

        <div
          class="font-sans text-xs font-medium uppercase tracking-widest"
          style="color: var(--purepy-run-success)"
        >
          {line.content}
        </div>

        <div class="h-px grow bg-zinc-700"></div>
      </div>
    {:else if line.kind === "success"}
      <div class="font-sans" style="color: var(--purepy-run-success)">
        {line.content}
      </div>
    {:else if line.kind === "error"}
      <div class="font-sans" style="color: var(--purepy-diagnostic-error)">
        {line.content}
      </div>
    {:else if line.kind === "muted"}
      <div class="mt-1 italic text-zinc-500">
        {line.content}
      </div>
    {:else}
      <div class="mt-1 whitespace-pre-wrap text-zinc-200">
        {line.content}
      </div>
    {/if}
  {/each}
</div>
