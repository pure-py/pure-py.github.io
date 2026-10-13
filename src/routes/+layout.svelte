<script lang="ts">
  import type { LayoutProps } from "./$types";
  import "$lib/styles.css";
  import { headerLinks } from "$lib/config/nav";

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
    {#each headerLinks as { url, title } (url)}
      <a href={url}>{title}</a>
    {/each}
  </nav>
</header>

<main>
  {@render children()}
</main>

<footer class="site-footer">
  <div class="footer-inner">
    <p>© {data.config.name} contributors</p>

    <nav>
      <a href={data.config.github}>GitHub</a>
      <a href={data.config.spec}>Specification (PDF)</a>
    </nav>
  </div>
</footer>
