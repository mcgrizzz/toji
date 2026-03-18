<script lang="ts">
	import { testProcessFixture } from '$lib/engine/fixtures/testProcesses';

	const { recipeName, recipeDescription, processSources, snapshots } = testProcessFixture;

	let selectedIndex = $state(0);

	const selectedSource = $derived(processSources[selectedIndex]);
	const selectedSnapshot = $derived(snapshots[selectedSource.processSnapshotEntityId]);

	function stagesFor(snapshot: typeof selectedSnapshot) {
		return [...snapshot.stages].sort((a, b) => a.ordinal - b.ordinal);
	}

	function substagesToStage(stageId: string) {
		return selectedSnapshot.substages
			.filter((ss) => ss.stageSpecId === stageId)
			.sort((a, b) => a.ordinal - b.ordinal);
	}

	function materialsForStage(stageId: string) {
		return selectedSnapshot.materialSlots
			.filter((m) => m.stageSpecId === stageId)
			.sort((a, b) => a.ordinal - b.ordinal);
	}

	function stepsForSubstage(substageId: string) {
		return selectedSnapshot.steps
			.filter((s) => s.substageSpecId === substageId)
			.sort((a, b) => a.ordinal - b.ordinal);
	}

	function fieldsForStep(stepId: string) {
		return selectedSnapshot.stepFields
			.filter((f) => f.stepSpecId === stepId)
			.sort((a, b) => a.ordinal - b.ordinal);
	}

	function defaultDisplay(field: (typeof selectedSnapshot.stepFields)[0]): string {
		if (field.valueType === 'number' && field.defaultNumberValue !== undefined)
			return String(field.defaultNumberValue);
		if (field.valueType === 'text' && field.defaultTextValue !== undefined)
			return field.defaultTextValue;
		if (field.valueType === 'boolean' && field.defaultBoolValue !== undefined)
			return String(field.defaultBoolValue);
		return '—';
	}
</script>

<div class="mx-auto max-w-4xl p-4 font-mono text-sm">
	<h1 class="text-lg font-semibold">Recipe: {recipeName}</h1>
	<p class="text-muted-foreground text-xs">{recipeDescription}</p>

	<section class="mt-6">
		<h2 class="text-sm font-semibold">Processes</h2>
		<div class="mt-2 flex gap-2">
			{#each processSources as src, i}
				<button
					type="button"
					class="rounded border px-3 py-1 text-xs {i === selectedIndex
						? 'border-foreground bg-foreground/10 font-bold'
						: 'border-border hover:bg-muted'}"
					onclick={() => (selectedIndex = i)}
				>
					{src.ordinal}. {src.label}
				</button>
			{/each}
		</div>
	</section>

	<section class="mt-6 rounded-lg border p-4">
		<h2 class="font-semibold">
			{selectedSnapshot.name}
			<span class="text-muted-foreground font-normal">({selectedSnapshot.processKind})</span>
		</h2>

		{#each stagesFor(selectedSnapshot) as stage}
			<div class="mt-4 border-l-2 border-foreground/20 pl-4">
				<h3 class="font-semibold">
					Stage {stage.ordinal}: {stage.label}
					<span class="text-muted-foreground text-xs font-normal">key={stage.key}</span>
				</h3>

				{#if materialsForStage(stage.id).length > 0}
					<div class="mt-2">
						<h4 class="text-muted-foreground text-xs font-semibold uppercase">Material Slots</h4>
						<ul class="mt-1 space-y-0.5">
							{#each materialsForStage(stage.id) as mat}
								<li class="text-xs">
									{mat.ordinal}. <strong>{mat.label}</strong> — {mat.materialClass} / {mat.quantityMode}
									{#if mat.quantityValue !== undefined}
										{mat.quantityValue}{mat.quantityUnit ?? ''}
									{/if}
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#each substagesToStage(stage.id) as substage}
					<div class="mt-3 ml-4">
						<h4 class="text-xs font-semibold">
							Substage {substage.ordinal}: {substage.label}
							<span class="text-muted-foreground font-normal">key={substage.key}</span>
						</h4>

						{#each stepsForSubstage(substage.id) as step}
							<div class="mt-2 ml-4 rounded border border-dashed p-2">
								<div class="text-xs font-semibold">
									Step {step.ordinal}: {step.label}
								</div>
								<div class="text-muted-foreground mt-1 text-xs">
									instruction: {step.instructionTemplate}
								</div>
								<div class="text-muted-foreground text-xs">
									checkable: {step.isCheckable}
									{#if step.scheduledOffsetH !== undefined}
										&middot; offset: {step.scheduledOffsetH}h
									{/if}
									{#if step.durationH !== undefined}
										&middot; duration: {step.durationH}h
									{/if}
								</div>

								{#if fieldsForStep(step.id).length > 0}
									<div class="mt-1">
										<span class="text-muted-foreground text-xs font-semibold uppercase">Fields</span>
										<ul class="mt-0.5 space-y-0.5">
											{#each fieldsForStep(step.id) as field}
												<li class="text-xs">
													{field.ordinal}. <strong>{field.label}</strong> ({field.valueType})
													{#if field.unit}unit={field.unit}{/if}
													default={defaultDisplay(field)}
													&middot; captureActual: {field.captureActualOnComplete}
												</li>
											{/each}
										</ul>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{/each}
	</section>
</div>
