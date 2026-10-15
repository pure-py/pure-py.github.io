<script lang="ts">
  import { page } from "$app/state";
  import Playground from "$lib/playground/App.svelte";
  import { State } from "$lib/playground/lib/app.svelte";
  import { params_from_url } from "$lib/playground/lib/share";
  import {
    decode_state,
    type EncodedState,
  } from "$lib/playground/lib/share/codec";
  import { onMount } from "svelte";

  // we have to do this ugly pattern because we need to avoid
  // trying to access the url.hash on the "server", and our
  // decompression is async
  let resolve: (state: State) => void;
  const app_promise = new Promise<State>((_resolve) => {
    resolve = _resolve;
  });

  // in theory we could do this work in parallel whilst loading
  // pyodide/codemirror, but getting this first makes our life
  // a lot easier, and it isn't expensive
  const load_state = async (params: EncodedState) => {
    const state = await decode_state(params.version, params.payload);
    const app = State.from(state);
    resolve(app);
  };

  // prefer to keep this callback synchronous
  onMount(() => {
    const params = params_from_url(page.url);
    if (params === null) {
      resolve(State.default());
      return;
    }
    load_state(params);
  });
</script>

<div class=""></div>

<div class="w-full h-dvh max-h-screen bg-zinc-900">
  {#await app_promise then app}
    <Playground {app} />
  {/await}
</div>
