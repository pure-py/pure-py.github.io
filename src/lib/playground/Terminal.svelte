<script lang="ts">
  import { type Stdout } from "$lib/playground/lib/stdout.svelte";
  type Props = { terminalHeight: number | undefined; stdout: Stdout };
  let { terminalHeight, stdout }: Props = $props();
</script>

<div
  class="w-full h-full min-h-32 overflow-y-scroll overflow-x-clip"
  style="height: {terminalHeight}px"
>
  <div class="h-full w-full font-mono p-2">
    {#each $state.eager(stdout.lines) as line, index (index)}
      <p
        class="whitespace-pre m-0 {line.is_err ? 'text-red-500' : 'text-white'}"
      >
        {line.content}
      </p>
    {/each}
  </div>
</div>
