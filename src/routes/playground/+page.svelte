<script lang="ts">
  import { page } from "$app/state";
  import Playground from "$lib/playground/App.svelte";
  import { State } from "$lib/playground/lib/app.svelte";
  import { params_from_url } from "$lib/playground/lib/share";
  import { decode_state } from "$lib/playground/lib/share/codec";
  import { onMount } from "svelte";

  let resolve: (state: State) => void;
  const app_promise = new Promise<State>((_resolve) => {
    resolve = _resolve;
  });

  onMount(async () => {
    const params = params_from_url(page.url);
    if (params === null) {
      resolve(State.default());
      return;
    }
    const state = await decode_state(params.version, params.payload);
    const app = State.from(state);
    resolve(app);
  });
</script>

<div class=""></div>

<div class="w-full h-dvh max-h-screen bg-zinc-900">
  {#await app_promise then app}
    <Playground {app} />
  {/await}
</div>
