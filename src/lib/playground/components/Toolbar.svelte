<script>
  import Kbd from "#lib/playground/components/toolbar/Kbd.svelte";
  import ToolbarButton from "#lib/playground/components/toolbar/ToolbarButton.svelte";
  import ToolbarLink from "#lib/playground/components/toolbar/ToolbarLink.svelte";

  let { share, check, run, is_busy, is_embed } = $props();
</script>

<div class="{is_embed ? 'absolute z-40 top-0  right-0' : 'w-full'} flex h-10">
  {#if !is_embed}
    <ToolbarLink href="/">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        class="size-4"
      >
        <path
          fill-rule="evenodd"
          d="M12.5 9.75A2.75 2.75 0 0 0 9.75 7H4.56l2.22 2.22a.75.75 0 1 1-1.06 1.06l-3.5-3.5a.75.75 0 0 1 0-1.06l3.5-3.5a.75.75 0 0 1 1.06 1.06L4.56 5.5h5.19a4.25 4.25 0 0 1 0 8.5h-1a.75.75 0 0 1 0-1.5h1a2.75 2.75 0 0 0 2.75-2.75Z"
          clip-rule="evenodd"
        />
      </svg>

      <p>Home</p></ToolbarLink
    >

    <span class="ml-auto"></span>
  {/if}

  <ToolbarButton onclick={share} busy={is_busy}>Share</ToolbarButton>
  <ToolbarButton onclick={check} busy={is_busy}>Check</ToolbarButton>
  <ToolbarButton onclick={run} busy={is_busy}>
    Run
    <Kbd>⌘S</Kbd>
  </ToolbarButton>
</div>
