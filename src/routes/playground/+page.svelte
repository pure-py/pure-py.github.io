<script lang="ts">
  import { page } from "$app/state";
  import Playground from "#lib/playground/App.svelte";
  import { State } from "#lib/playground/lib/app.svelte.js";
  import { type SharableState } from "#lib/playground/lib/share/codec.js";
  import { browser } from "$app/env";

  let { data } = $props();

  const get_app = (state: SharableState | null) => {
    try {
      if (state === null) {
        return State.default();
      }
      return State.from(state);
    } catch (error) {
      data.error = error;
    }
  };

  // svelte-ignore state_referenced_locally (we only want the initial value)
  const app = get_app(data.state);
</script>

<svelte:head>
  <title>Playground | {data.config.name}</title>
</svelte:head>

<div class="w-full h-dvh max-h-screen bg-zinc-900">
  <!--
    TODO: This has the same effective behaviour as the previous
    await/then implementation. We want to remove this check so that
    as much as possible is prerendered at build time. Currently we
    avoid this as the prerender doesn't have an estimate for the size
    of the editor etc elements and we don't want to avoid large content
    shifts.
  -->
  {#if data.error}
    <div
      class="flex h-full flex-col items-center justify-center gap-4 px-6 text-center text-zinc-400"
    >
      <p>
        {data.error instanceof Error
          ? data.error.message
          : "Unable to load the playground."}
      </p>

      <a
        href={page.url.pathname}
        data-sveltekit-reload
        class="rounded-md border border-zinc-700 px-4 py-2 text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white"
      >
        Go to the main playground
      </a>
    </div>
  {:else if browser && app !== undefined}
    <Playground {app} />
  {:else}
    <div class="flex h-full items-center justify-center text-zinc-400">
      Loading playground …
    </div>
  {/if}
</div>
