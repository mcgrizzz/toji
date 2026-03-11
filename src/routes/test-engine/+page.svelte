<script lang="ts">
	import { recipeInput } from '$lib/engine/testInput';
	import { resolveRecipe } from '$lib/engine/resolveRecipe';
	import type { EngineInput, EngineOutput } from '$lib/engine/engineTypes';

	let draft = $state(JSON.stringify(recipeInput, null, 2));

	function safeParse(text: string): { value: EngineInput | null; error: string | null } {
        try {
            const v = JSON.parse(text) as EngineInput;
            return { value: v, error: null };
        } catch (e) {
            return { value: null, error: e instanceof Error ? e.message : String(e) };
        }
	}

	function reset() {
		draft = JSON.stringify(recipeInput, null, 2);
	}

	const parsed = $derived(safeParse(draft));
	const output = $derived.by<EngineOutput | null>(() => {
		if (!parsed.value) return null;
		return resolveRecipe(parsed.value);
	});
</script>

<div class="mx-auto max-w-6xl p-4">
  <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 class="text-lg font-semibold">Engine Debug</h1>
      <p class="text-sm text-muted-foreground">
        Left: <code class="rounded bg-muted px-1 py-0.5">EngineInput</code> (editable). Right:
        <code class="rounded bg-muted px-1 py-0.5">EngineOutput</code> (computed).
      </p>
    </div>

    <button
      type="button"
      class="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
      onclick={reset}
    >
      Reset
    </button>
  </div>

  {#if parsed.error}
    <div class="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
      <div class="font-medium">JSON parse error</div>
      <div class="mt-1 font-mono text-xs whitespace-pre-wrap">{parsed.error}</div>
    </div>
  {/if}

  <div class="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
    <section class="rounded-lg border bg-background">
      <div class="border-b px-4 py-2">
        <h2 class="text-sm font-medium">EngineInput</h2>
      </div>
      <div class="p-3">
        <textarea
          bind:value={draft}
          spellcheck="false"
          class="h-[70vh] w-full resize-none rounded-md border bg-background p-3 font-mono text-xs leading-5 outline-none focus:ring-2 focus:ring-ring"
        ></textarea>
      </div>
    </section>

    <section class="rounded-lg border bg-background">
      <div class="border-b px-4 py-2 flex items-center justify-between">
        <h2 class="text-sm font-medium">EngineOutput</h2>
        {#if !output}
          <span class="text-xs text-muted-foreground">waiting for valid JSON…</span>
        {/if}
      </div>

      <div class="p-3">
        <pre class="h-[70vh] overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs leading-5">
{output ? JSON.stringify(output, null, 2) : ""}
        </pre>
      </div>
    </section>
  </div>
</div>
