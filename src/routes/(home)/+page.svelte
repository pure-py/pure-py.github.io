<script lang="ts">
  import type { PageProps } from "./$types";
  let { data }: PageProps = $props();
</script>

<section id="top" class="hero">
  <h1>
    <img class="hero-logo" src={data.config.logo} alt={data.config.name} />
  </h1>
  <p class="tagline">
    A pure functional subset of Python for scientific computing
  </p>
  <p class="lede">
    A versioned standard with a formal grammar, formal semantics, and a
    reference implementation for a mutation-free subset of Python.
  </p>
  <div class="cta">
    <a class="button primary" href={data.config.spec}>Read the spec</a>

    {#if data.config.github}
      <a class="button" href={data.config.github}>GitHub</a>
    {/if}
  </div>
</section>

<section id="overview" class="prose">
  <h2>Overview</h2>
  <p>
    {data.config.name} defines a pure, mutation-free subset of Python. It is aimed
    initially at researchers in programming languages and computer science education,
    and is intended to grow into a common language for scientific computing, supporting
    portable applications in modelling, data processing, analysis, and visualisation.
  </p>
  <p>
    The standard defines a versioned formal grammar, a formal semantics, and a
    reference implementation. Every compliant implementation accepts any valid {data
      .config.name}
    program and behaves according to the formal semantics.
  </p>
</section>

<section class="code-sample">
  <figure>
    <pre><code
        ><span class="tok-kw">from</span> dataclasses <span class="tok-kw"
          >import</span
        > dataclass

<span class="tok-decorator">@dataclass</span>
<span class="tok-kw">class</span> <span class="tok-class">Point</span>:
    x: <span class="tok-type">int</span>
    y: <span class="tok-type">int</span>

<span class="tok-kw">def</span> <span class="tok-fn">describe</span>(p: <span
          class="tok-class">Point</span
        >) -&gt; <span class="tok-type">str</span>:
    kind: <span class="tok-type">str</span>
    <span class="tok-kw">match</span> p:
        <span class="tok-kw">case</span> <span class="tok-class">Point</span
        >(<span class="tok-num">0</span>, <span class="tok-num">0</span>):
            kind = <span class="tok-str">"origin"</span>
        <span class="tok-kw">case</span> <span class="tok-class">Point</span
        >(x, y):
            kind = <span class="tok-str">"point"</span>
    <span class="tok-kw">return</span> kind

<span class="tok-builtin">print</span>(<span class="tok-fn">describe</span
        >(<span class="tok-class">Point</span>(<span class="tok-num">3</span
        >, <span class="tok-num">4</span>)))</code
      ></pre>
    <figcaption>
      The declaration <code>kind: str</code> is mandatory. Later assignments to
      <code>kind</code> are treated as deferred initialisation, as for blank final
      variables in Java. Reassignment on a given branch is therefore not permitted.
    </figcaption>
  </figure>
</section>

<section id="features" class="features">
  <h2>Why {data.config.name}</h2>
  <div class="grid">
    <div class="card">
      <h3>Pure &amp; functional</h3>
      <p>
        Mutation-free; functions are referentially transparent. All variable
        resolution is static.
      </p>
    </div>
    <div class="card">
      <h3>Statically typed</h3>
      <p>
        Mandatory type annotations and a type system which accepts only programs
        well-typed under mypy.
      </p>
    </div>
    <div class="card">
      <h3>Pythonic</h3>
      <p>
        A strict subset of Python: every valid {data.config.name} program is valid
        Python, and runs with exactly the same runtime behaviour.
      </p>
    </div>
    <div class="card">
      <h3>Formally specified</h3>
      <p>
        Well-formedness rules and operational semantics mechanised in
        Isabelle/HOL, with proof of soundness.
      </p>
    </div>
    <div class="card">
      <h3>Portable</h3>
      <p>
        Python dialects are compliant by definition, checked on CPython, GraalPy
        and Pyodide. Research languages like
        {#each data.config.languages as language, index (language.name)}
          {index > 0 ? " and " : ""}{#if language.url}<a href={language.url}
              >{language.name}</a
            >{:else}{language.name}{/if}
        {/each}
        can be too.
      </p>
    </div>
    <div class="card">
      <h3>For science and education</h3>
      <p>
        Reproducible, deterministic, and easy to reason about, for researchers
        developing new Python-based languages or for students learning to
        program.
      </p>
    </div>
  </div>
</section>
