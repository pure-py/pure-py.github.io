<script lang="ts">
  import { type Stdout } from "$lib/playground/lib/stdout.svelte";
  type Props = { terminalHeight: number | undefined; stdout: Stdout };
  let { terminalHeight, stdout }: Props = $props();

  const MIN_HEIGHT = 128;

  let height = $derived(terminalHeight ?? MIN_HEIGHT);
</script>

<div
  class="min-h-32 font-mono p-2 overflow-y-scroll overflow-x-clip"
  style="height: {height}px; min-height: {MIN_HEIGHT}px; max-height: {height}px;"
>
  {#each $state.eager(stdout.lines) as line, index (index)}
    <p class="whitespace-pre m-0 {line.is_err ? 'text-red-500' : 'text-white'}">
      {line.content}
    </p>
  {/each}
</div>
