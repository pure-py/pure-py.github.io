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
      const proposedHeight = availableHeight - clientY - 24;

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
  class="h-px bg-gray-700 hover:bg-gray-600 active:bg-blue-900 flex justify-center items-center cursor-ns-resize group"
>
  <div class=" z-10 w-full flex justify-center">
    <div
      class="size-5 text-blue-200 bg-gray-700/50 group-hover:bg-gray-500/50 group-active:bg-blue-900/50 rounded-full flex justify-center items-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        class="size-4"
      >
        <path
          fill-rule="evenodd"
          d="M5.22 10.22a.75.75 0 0 1 1.06 0L8 11.94l1.72-1.72a.75.75 0 1 1 1.06 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 0 1 0-1.06ZM10.78 5.78a.75.75 0 0 1-1.06 0L8 4.06 6.28 5.78a.75.75 0 0 1-1.06-1.06l2.25-2.25a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06Z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
  </div>
</button>
