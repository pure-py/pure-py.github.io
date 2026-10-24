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
  let reject: (error: unknown) => void;

  const app_promise = new Promise<State>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  // in theory we could do this work in parallel whilst loading
  // pyodide/codemirror, but getting this first makes our life
  // a lot easier, and it isn't expensive
  const load_state = async (params: EncodedState) => {
    try {
      const state = await decode_state(params.version, params.payload);
      const app = State.from(state);

      resolve(app);
    } catch (error) {
      console.error(error);
      reject(new Error("Unable to load the shared playground."));
    }
  };

  // prefer to keep this callback synchronous
  onMount(() => {
    try {
      const params = params_from_url(page.url);

      if (params === null) {
        try {
          resolve(State.default());
        } catch (error) {
          console.error(error);
          reject(new Error("Unable to load the example files."));
        }

        return;
      }

      load_state(params);
    } catch (error) {
      // A malformed `#share=` fragment can throw while parsing the URL,
      // before `load_state` is called.
      console.error(error);
      reject(new Error("Unable to load the shared playground."));
    }
  });
</script>

<div class="w-full h-dvh max-h-screen bg-zinc-900">
  {#await app_promise}
    <div class="flex h-full items-center justify-center text-zinc-400">
      Loading playground …
    </div>
  {:then app}
    <Playground {app} />
  {:catch error}
    <div
      class="flex h-full flex-col items-center justify-center gap-4 px-6 text-center text-zinc-400"
    >
      <p>
        {error instanceof Error
          ? error.message
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
  {/await}
</div>
