<script lang="ts">
  import { page } from "$app/state";
  import Playground from "$lib/playground/App.svelte";
  import { State } from "$lib/playground/lib/app.svelte";
  import {
    files_from_params,
    params_from_url,
  } from "$lib/playground/lib/share";
  import { onMount } from "svelte";

  let resolve: (state: State) => void;
  const app_promise = new Promise<State>((_resolve) => {
    resolve = _resolve;
  });

  onMount(async () => {
    const state = params_from_url(page.url);
    console.log(state);
    if (state === null) {
      resolve(State.default());
      return;
    }
    const files = await files_from_params(state);
    console.log(files);
    const app = new State(files);
    resolve(app);
  });
</script>

<div class=""></div>

<div class="w-full h-dvh max-h-screen bg-zinc-900">
  {#await app_promise then app}
    <Playground {app} />
  {/await}
</div>
