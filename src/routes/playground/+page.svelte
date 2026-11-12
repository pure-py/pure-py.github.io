<script lang="ts">
  import { page } from "$app/state";
  import Playground from "#lib/playground/App.svelte";
  import { State } from "#lib/playground/lib/app.svelte.js";
  import { type SharableState } from "#lib/playground/lib/share/codec.js";

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
  {#if app !== undefined && data.error === null}
    <Playground {app} />
  {:else}
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
  {/if}
</div>
