<script lang="ts">
  type Props = { setHeight: (height: number) => void };
  let { setHeight }: Props = $props();

  let availableHeight: number | undefined = $state();

  // when the dragger is clicked, we register an event listener for mouse movement,
  // in order to extract the y position of the mouse. when the click is released
  // (i.e. user has stopped click-and-dragging), we deregister the event listener.
  //
  // TODO: check mobile. there is a touchdown or similar event. pointer down might
  // be more approrpriate and cover both.
  //
  const onmousedown = () => {
    const onmousemove = ({ clientY }: MouseEvent) => {
      if (availableHeight === undefined) {
        return;
      }

      // the height of the window, offset by the mouse y position,
      // minus the height of this dragger element itself, minus
      // the statusbar height
      const proposedHeight = availableHeight - clientY - 16 - 24;

      // these aren't strictly necessary, but it will make it easier
      // to not break anything here
      const minHeight = 128;
      const maxHeight = (availableHeight / 3) * 2;

      const boundedHeight = Math.max(
        minHeight,
        Math.min(maxHeight, proposedHeight),
      );

      setHeight(boundedHeight);
    };

    const onmouseup = () => {
      window.removeEventListener("mouseup", onmouseup);
      window.removeEventListener("mousemove", onmousemove);
    };

    window.addEventListener("mouseup", onmouseup);
    window.addEventListener("mousemove", onmousemove);
  };
</script>

<svelte:window bind:innerHeight={availableHeight} />

<button
  {onmousedown}
  aria-label="Resize terminal"
  class="min-h-4 max-h-4 border-white border-t w-full cursor-row-resize hover:bg-zinc-800"
></button>
