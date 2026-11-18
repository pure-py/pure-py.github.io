<script lang="ts">
  import type { LayoutProps } from "./$types";
  import "#lib/styles.css";

  let { children, data }: LayoutProps = $props();
</script>

<svelte:head>
  <title>{data.config.name}</title>
  <link rel="icon" href={data.config.favicon} />

  <meta
    name="description"
    content="{data.config
      .name}: a pure functional subset of Python for scientific computing. Formal specification and reference implementation."
  />
</svelte:head>

<header class="site-header">
  <h1 class="brand">
    <img class="brand-logo" src={data.config.logo} alt={data.config.name} />
  </h1>
  <nav class="site-nav">
    <a href={data.config.spec} target="_blank">Spec</a>
    {#if data.config.github}
      <a href={data.config.github} target="_blank">GitHub</a>
    {/if}
    <a href="/playground">Playground</a>
  </nav>
</header>

<main>
  {@render children()}
</main>

<footer class="site-footer">
  <div class="footer-inner">
    <p>© 2026 {data.config.name} contributors</p>
  </div>
</footer>
