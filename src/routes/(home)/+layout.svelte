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
      .name}: a pure, functional subset of Python for scientific computing. Formal specification and reference checker."
  />
</svelte:head>

<header class="site-header">
  <a class="brand" href="#top"
    ><img class="brand-logo" src={data.config.logo} alt={data.config.name} /></a
  >
  <nav class="site-nav">
    <a href="/#overview">Overview</a>
    <a href="/#features">Features</a>
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
    <p>© {data.config.name} contributors</p>
    <nav>
      {#if data.config.github}
        <a href={data.config.github} target="_blank">GitHub</a>
      {/if}
      <a href={data.config.spec} target="_blank">Specification (PDF)</a>
    </nav>
  </div>
</footer>
