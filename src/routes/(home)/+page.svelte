<script lang="ts">
  import App from "#lib/playground/App.svelte";
  import { State } from "#lib/playground/lib/app.svelte.ts";
  import type { PageProps } from "./$types";
  let { data }: PageProps = $props();

  const example = `from dataclasses import dataclass
from typing import Any

@dataclass
class Point:
    x: Any
    y: Any

def describe(p):
    match p:
        case Point(0, 0):
            return "origin"
        case Point(x, y):
            return "point"

print(describe(Point(3, 4)))
`;
</script>

<section id="top" class="hero">
  <h1>
    <img class="hero-logo" src={data.config.logo} alt={data.config.name} />
  </h1>
  <p class="tagline">
    A pure, functional subset of Python for scientific computing
  </p>
  <p class="lede">
    A versioned standard with a formal grammar, formal semantics, and a
    reference checker for a side-effect-free subset of Python.
  </p>
  <div class="cta">
    <a class="button primary" href={data.config.spec}>Read the spec</a>

    <a class="button" href={data.config.github}>GitHub</a>
  </div>
</section>

<section id="overview" class="prose">
  <h2>Overview</h2>
  <p>
    {data.config.name} defines a pure, side-effect-free subset of Python. It is aimed
    initially at researchers in programming languages and pedagogy, and is intended
    to grow into a common language for scientific computing, supporting portable applications
    in modelling, data processing, analysis, and visualisation.
  </p>
  <p>
    The standard defines a versioned formal grammar, a formal semantics, and a
    reference checker. Every compliant implementation accepts any valid {data
      .config.name}
    program and behaves according to the formal semantics.
  </p>
</section>

<section>
  <div class="h-96 max-h-96">
    <App
      app={State.from({ files: [{ path: "main.py", data: example }] })}
      is_embed={true}
    />
  </div>
</section>

<section id="features" class="features">
  <h2>Why {data.config.name}</h2>
  <div class="grid">
    <div class="card">
      <h3>Pure &amp; functional</h3>
      <p>No side effects. Functions are referentially transparent.</p>
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
      <p>A grammar, well-formedness rules, and an operational semantics.</p>
    </div>
    <div class="card">
      <h3>Portable</h3>
      <p>
        Python dialects are compliant by definition, checked on CPython, PyPy,
        GraalPy and Pyodide. Research languages like <a
          href="https://f.luid.org">Fluid</a
        >
        and
        <a href="https://github.com/plas4sci/fortl">Fortl</a> can be too.
      </p>
    </div>
    <div class="card">
      <h3>For science</h3>
      <p>Reproducible, deterministic, and easy to reason about.</p>
    </div>
    <div class="card">
      <h3>Checkable</h3>
      <p>
        A reference checker decides membership of the subset and flags use of
        unassigned variables.
      </p>
    </div>
  </div>
</section>
