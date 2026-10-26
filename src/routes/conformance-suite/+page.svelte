<script lang="ts">
  import { group } from "#lib/conformance/path.js";
  let { data } = $props();
  let grouped = $derived(group(data.tests));
</script>

<ul>
  {#each grouped as { level, level_groups }, index (index)}
    <li>
      <details open>
        <summary>{level}</summary>
        <ul>
          {#each level_groups as { python_outcome, python_outcome_groups }, index (index)}
            <li class="pl-4">
              <details open>
                <summary>{python_outcome}</summary>
                <ul>
                  {#each python_outcome_groups as { purepy_outcome, tests }, index (index)}
                    <li class="pl-4">
                      <details open>
                        <summary>{purepy_outcome}</summary>
                        <ul>
                          {#each tests as { name, path }, index (index)}
                            <li class="pl-4">
                              <a
                                class="text-blue-700"
                                href="/conformance-suite/{path}">{name}</a
                              >
                            </li>
                          {/each}
                        </ul>
                      </details>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}
        </ul>
      </details>
    </li>
  {/each}
</ul>
