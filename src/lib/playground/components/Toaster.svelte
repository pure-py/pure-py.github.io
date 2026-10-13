<script module lang="ts">
  import Kbd from "$lib/playground/components/toolbar/Kbd.svelte";

  export type Toast = {
    id: number;
    message: string;
    shortcut?: {
      keys: string[];
      action: string;
    };
    kind: "info" | "success" | "error";
  };

  let next_id = 0;

  export const toasts = $state<Toast[]>([]);

  export const toast = (
    message: string,
    kind: Toast["kind"] = "info",
    shortcut?: Toast["shortcut"],
  ) => {
    const id = next_id++;

    toasts.push({ id, message, shortcut, kind });

    setTimeout(() => {
      const index = toasts.findIndex((item) => item.id === id);

      if (index !== -1) {
        toasts.splice(index, 1);
      }
    }, 5000);
  };
</script>

<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
  {#each toasts as item (item.id)}
    <div
      role="status"
      class="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm shadow-lg
        {item.kind === 'error'
        ? 'bg-red-950 text-red-100 border border-red-700'
        : item.kind === 'success'
          ? 'bg-emerald-950 text-emerald-100 border border-emerald-700'
          : 'bg-zinc-800 text-zinc-100 border border-zinc-600'}"
    >
      <span>{item.message}</span>

      {#if item.shortcut}
        {#each item.shortcut.keys as key (key)}
          <Kbd>{key}</Kbd>
        {/each}

        <span>{item.shortcut.action}</span>
      {/if}
    </div>
  {/each}
</div>
