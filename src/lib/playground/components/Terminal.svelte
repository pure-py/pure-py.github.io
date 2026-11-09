<script lang="ts">
  import { type Stdout } from "#lib/playground/lib/stdout.svelte.js";

  type Props = { stdout: Stdout };
  let { stdout }: Props = $props();

  let terminal: HTMLDivElement | undefined;

  $effect(() => {
    const line_count = stdout.lines.length;

    if (line_count === 0) return;

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
  class="font-mono text-sm h-full overflow-y-scroll overflow-x-clip"
>
  <div class="pb-4">
    {#each stdout.lines as line, index (index)}
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
        <div class="font-sans px-4" style="color: var(--purepy-run-success)">
          {line.content}
        </div>
      {:else if line.kind === "error"}
        <div
          class="font-sans px-4"
          style="color: var(--purepy-diagnostic-error)"
        >
          {line.content}
        </div>
      {:else if line.kind === "muted"}
        <div class="mt-1 italic text-zinc-500 px-4">
          {line.content}
        </div>
      {:else}
        <div class="mt-1 whitespace-pre-wrap text-zinc-200 px-4">
          {line.content}
        </div>
      {/if}
    {/each}
  </div>
</div>
