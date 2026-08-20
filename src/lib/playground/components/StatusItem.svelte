<script lang="ts">
  type Props = {
    type: "Check" | "Evaluate";
    success: boolean | null;
    time: number;
  };

  let { type, success, time }: Props = $props();
</script>

<div class="flex items-center gap-1">
  <div class="shrink-0">
    {#if success === true}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        class="size-4 text-green-500"
      >
        <path
          fill-rule="evenodd"
          d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
          clip-rule="evenodd"
        />
      </svg>
    {:else if success === false}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        class="size-4 text-red-500"
      >
        <path
          d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z"
        />
      </svg>
    {/if}
  </div>

  {#if success !== null}
    <p>
      <span>{type}</span>
      <span class="text-gray-400 font-light ml-0.5">{time}ms</span>
    </p>
  {/if}
</div>
