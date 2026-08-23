<script lang="ts">
  import StatusItem from "$lib/playground/components/statusbar/StatusItem.svelte";
  import type { Status } from "$lib/playground/lib/state";

  type Props = { status: Status };

  let { status }: Props = $props();
</script>

<div
  class="min-h-6 max-h-6 px-2 flex justify-between items-center bg-gray-950 text-blue-50 text-xs font-medium"
>
  <div>
    <p>
      {#if status.has_unsaved_changes}
        Unsaved changes
      {:else}
        Up to date
      {/if}
    </p>
  </div>

  <div class="flex gap-2">
    <StatusItem
      type="Evaluate"
      success={status.eval_success}
      time={status.eval_time}
    />
    <StatusItem
      type="Check"
      success={status.check_success}
      time={status.check_time}
    />
  </div>
</div>
