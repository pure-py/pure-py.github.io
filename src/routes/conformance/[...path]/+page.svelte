<script lang="ts">
  import Playground from "#lib/playground/App.svelte";
  import { State } from "#lib/playground/lib/app.svelte.ts";

  const { data } = $props();
</script>

<div class="w-full h-dvh max-h-screen bg-zinc-900">
  <Playground app={State.from(data.state)} />
</div>
