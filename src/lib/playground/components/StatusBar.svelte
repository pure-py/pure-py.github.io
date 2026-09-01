<script lang="ts">
  import StatusItem from "$lib/playground/components/statusbar/StatusItem.svelte";
  import type { Result } from "../lib/app.svelte";

  type Props = {
    dirty: boolean;
    check_result: Result | null;
    eval_result: Result | null;
  };

  let { dirty, check_result, eval_result }: Props = $props();
</script>

<div
  class="min-h-6 max-h-6 px-2 flex justify-between items-center bg-gray-950 text-blue-50 text-xs font-medium"
>
  <div>
    <p>
      {#if dirty}
        Unsaved changes
      {:else}
        Up to date
      {/if}
    </p>
  </div>

  <div class="flex gap-2">
    <StatusItem type="Evaluate" result={eval_result} />
    <StatusItem type="Check" result={check_result} />
  </div>
</div>
