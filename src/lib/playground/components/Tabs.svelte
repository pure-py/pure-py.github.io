<script lang="ts">
  import type { State } from "../lib/app.svelte";
  import { toast } from "./Toaster.svelte";

  let { app }: { app: State } = $props();

  let new_file_prompt = $state(false);
  let new_file_name = $state("");
  let new_file_input: HTMLInputElement | undefined = $state();
  let last_create_error: string | null = $state(null);
  let creating_file = $state(false);

  let renaming_file_index: number | null = $state(null);
  let renaming_name = $state("");
  let rename_input: HTMLInputElement | undefined = $state();
  let last_rename_error: string | null = $state(null);

  function focus_on_mount(node: HTMLInputElement) {
    node.focus();
  }

  const error_count = (path: string) =>
    app.diagnostics.filter(
      (diagnostic) => diagnostic.file === path && diagnostic.line !== null,
    ).length;

  const show_error_once = (
    message: string,
    last_error: string | null,
    set_last_error: (message: string | null) => void,
  ) => {
    if (message === last_error) return;

    toast(message, "error");
    set_last_error(message);
  };

  const open_new_file_prompt = () => {
    new_file_prompt = true;
    last_create_error = null;
  };

  const cancel_new_file = () => {
    new_file_name = "";
    last_create_error = null;
    new_file_prompt = false;
  };

  const create_file = () => {
    if (creating_file) return;

    const name = new_file_name.trim();

    if (name === "") {
      cancel_new_file();
      return;
    }

    creating_file = true;

    try {
      app.fs.new(name);

      new_file_name = "";
      new_file_prompt = false;
      last_create_error = null;

      toast(`Created “${name}”`, "success");
    } catch (error) {
      show_error_once(
        error instanceof Error
          ? error.message
          : `Create failed: could not create “${name}”`,
        last_create_error,
        (message) => (last_create_error = message),
      );

      requestAnimationFrame(() => {
        new_file_input?.focus();
      });
    } finally {
      creating_file = false;
    }
  };

  const start_rename = (index: number, current_name: string) => {
    renaming_file_index = index;
    renaming_name = current_name;
    last_rename_error = null;
  };

  const cancel_rename = () => {
    renaming_file_index = null;
    renaming_name = "";
    last_rename_error = null;
  };

  const commit_rename = () => {
    if (renaming_file_index === null) return;

    const fd = renaming_file_index;
    const new_name = renaming_name.trim();
    const current_name = app.fs.files[fd]?.path;

    if (new_name === "" || new_name === current_name) {
      cancel_rename();
      return;
    }

    try {
      app.fs.rename(fd, new_name);

      toast(`Renamed “${current_name}” to “${new_name}”`, "success");

      cancel_rename();
    } catch (error) {
      show_error_once(
        error instanceof Error
          ? error.message
          : `Rename failed: could not rename “${current_name}” to “${new_name}”`,
        last_rename_error,
        (message) => (last_rename_error = message),
      );

      requestAnimationFrame(() => {
        rename_input?.focus();
      });
    }
  };

  const on_new_file_keydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      cancel_new_file();
    }
  };

  const on_rename_keydown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit_rename();
    } else if (event.key === "Escape") {
      cancel_rename();
    }
  };

  const path_segments = (path: string) => path.split("/");
</script>

{#snippet file_path(
  path: string,
  inactive: boolean,
  unsaved: boolean,
  has_errors: boolean,
)}
  <div class="inline-flex items-baseline gap-x-1.5">
    <div class="size-2">
      {#if unsaved}
        <div class="size-full rounded-full bg-white"></div>
      {/if}
    </div>

    <div class="inline-flex items-baseline gap-x-0.5">
      {#each path_segments(path) as segment, segment_index (`${segment_index}-${segment}`)}
        {#if segment_index > 0}
          <span class={inactive ? "text-zinc-600" : "text-zinc-500"}>/</span>
        {/if}

        <span
          class={[
            has_errors &&
              segment_index === path_segments(path).length - 1 &&
              "cm-diagnostic-underline",
          ]}
        >
          {segment}
        </span>
      {/each}
    </div>
  </div>
{/snippet}

<div class="h-8 flex w-full">
  {#each app.fs.files as file, index (file.path)}
    {#if app.fs.active_fd === index}
      <div
        class="px-1.5 gap-2 flex items-center text-sm rounded-t-md bg-[#282c34] text-white border border-t-zinc-500 border-x-zinc-500 border-b-transparent"
      >
        <div class="inline-flex items-baseline pb-0.5">
          {#if renaming_file_index === index}
            <input
              type="text"
              bind:value={renaming_name}
              bind:this={rename_input}
              onblur={commit_rename}
              onkeydown={on_rename_keydown}
              use:focus_on_mount
            />
          {:else}
            <button
              type="button"
              title="Double-click to rename"
              class="cursor-text inline-flex items-baseline"
              ondblclick={() => start_rename(index, file.path)}
            >
              {@render file_path(file.path, false, file.dirty, false)}
            </button>
          {/if}
        </div>

        <div class="flex justify-end w-6">
          {#if app.fs.files.length > 1 && renaming_file_index !== index}
            <button
              title="Delete file"
              class="cursor-pointer"
              onclick={() => app.fs.remove(index)}
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
      <button
        type="button"
        onclick={() => {
          if (renaming_file_index !== null || new_file_prompt) return;

          app.fs.open(index);
        }}
        class="px-1.5 gap-2 flex justify-center items-center text-sm cursor-pointer rounded-t-md bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300 border border-t-transparent border-x-transparent border-b-zinc-500"
      >
        <div
          class="inline-flex items-baseline pb-0.5"
          title={error_count(file.path) > 0
            ? `${error_count(file.path)} error${
                error_count(file.path) === 1 ? "" : "s"
              }`
            : undefined}
        >
          {@render file_path(
            file.path,
            true,
            file.dirty,
            error_count(file.path) > 0,
          )}
        </div>

        <div class="flex items-center justify-end w-6"></div>
      </button>
    {/if}
  {/each}

  <div class="border-b border-zinc-500 w-full flex">
    {#if new_file_prompt}
      <div
        class="px-4 flex justify-center items-center text-sm cursor-pointer rounded-t-md bg-zinc-800 text-zinc-200"
      >
        <form
          onsubmit={(event) => {
            event.preventDefault();
            create_file();
          }}
        >
          <input
            type="text"
            bind:value={new_file_name}
            bind:this={new_file_input}
            onfocusout={create_file}
            onkeydown={on_new_file_keydown}
            use:focus_on_mount
          />
        </form>
      </div>
    {:else}
      <button
        onclick={open_new_file_prompt}
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
