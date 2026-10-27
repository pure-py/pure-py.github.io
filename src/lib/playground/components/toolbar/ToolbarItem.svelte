<script lang="ts">
  let { children } = $props();
</script>

<div
  class="h-full inline-flex items-center gap-x-1.5 px-2.5 py-1 text-sm font-semibold text-white shadow-xs hover:bg-zinc-700"
>
  {@render children()}
</div>
