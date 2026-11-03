<script lang="ts">
  import ToolbarItem from "./ToolbarItem.svelte";

  let { children, onclick, busy = false } = $props();
</script>

<button
  {onclick}
  disabled={busy}
  class="h-full {busy ? 'cursor-wait' : 'cursor-pointer'}"
  type="button"
>
  <ToolbarItem>
    {@render children()}
  </ToolbarItem>
</button>
