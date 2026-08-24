<script lang="ts">
  import type { State } from "../lib/app.svelte";

  let { app }: { app: State } = $props();

  let new_file_prompt = $state(false);
  let new_file_name = $state("");

  let onfocusout = () => {
    new_file_prompt = false;

    if (new_file_name === "") {
      return;
    }

    app.new_file(new_file_name);
    new_file_name = "";
  };
</script>

<div class="h-8 flex w-full">
  {#each app.files as file, index (file.path)}
    {#if app.active_file_index === index}
      <div
        class="px-1.5 gap-2 flex justify-center items-center text-sm rounded-t-md bg-[#282c34] text-white border border-t-zinc-500 border-x-zinc-500 border-b-transparent"
      >
        <div>
          {file.path}
        </div>

        <div class="flex items-center justify-end gap-1 w-6">
          {#if app.files.length > 1}
            <button
              title="Delete file"
              class="cursor-pointer"
              onclick={() => app.delete_open_file()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                class="size-3 text-zinc-500 hover:text-zinc-400"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          {/if}
        </div>
      </div>
    {:else}
      <div
        tabindex="-1"
        onkeyup={() => {}}
        role="button"
        onclick={() => app.open_file(index)}
        class="px-1.5 gap-2 flex justify-center items-center text-sm cursor-pointer rounded-t-md bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300 border border-t-transparent border-x-transparent border-b-zinc-500"
      >
        <div>
          {file.path}
        </div>

        <div class="flex items-center justify-end gap-1 w-6"></div>
      </div>
    {/if}
  {/each}

  <div class="border-b border-zinc-500 w-full flex">
    {#if new_file_prompt}
      <div
        class="px-4 flex justify-center items-center text-sm cursor-pointer rounded-t-md bg-zinc-800 text-zinc-200"
      >
        <form onsubmit={() => {}}>
          <!-- svelte-ignore a11y_autofocus -->
          <input
            type="text"
            bind:value={new_file_name}
            {onfocusout}
            autofocus={true}
          />
        </form>
      </div>
    {:else}
      <button
        onclick={() => (new_file_prompt = true)}
        title="New file"
        class="ml-1 px-2 flex justify-center items-center cursor-pointer text-zinc-500 hover:text-zinc-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          class="size-4"
        >
          <path
            d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z"
          />
        </svg>
      </button>
    {/if}
  </div>
</div>
