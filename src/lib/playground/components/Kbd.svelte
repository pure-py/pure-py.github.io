<script lang="ts">
  let { children } = $props();
</script>

<div
  class=" border-gray-500 border px-1 rounded-sm text-xs font-light font-sans"
>
  {@render children()}
</div>
