<script lang="ts">
	import { testProcessFixture } from '$lib/engine/fixtures/testProcesses';

	const { recipeName, recipeDescription, processSources, snapshots } = testProcessFixture;

	let selectedIndex = $state(0);
	let selectedStageId = $state<string | null>(null);

	const selectedSource = $derived(processSources[selectedIndex]);
	const selectedSnapshot = $derived(snapshots[selectedSource.processSnapshotEntityId]);
	const sortedStages = $derived(stagesFor(selectedSnapshot));
	const visibleStages = $derived(
		selectedStageId === null
			? sortedStages
			: sortedStages.filter((s) => s.id === selectedStageId)
	);

	$effect(() => {
		selectedIndex;
		selectedStageId = null;
	});

	function stagesFor(snapshot: typeof selectedSnapshot) {
		return [...snapshot.stages].sort((a, b) => a.ordinal - b.ordinal);
	}

	function materialsForStage(stageId: string) {
		return selectedSnapshot.materialSlots
			.filter((m) => m.stageSpecId === stageId)
			.sort((a, b) => a.ordinal - b.ordinal);
	}

	function stepsForStage(stageId: string) {
		return selectedSnapshot.steps
			.filter((s) => s.stageSpecId === stageId)
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

<div class="flex h-screen overflow-hidden font-mono text-sm">
	<!-- Sidebar -->
	<aside
		class="bg-sidebar text-sidebar-foreground flex w-64 shrink-0 flex-col overflow-y-auto border-r border-border"
	>
		<!-- Recipe header -->
		<div class="border-b border-border p-4">
			<h1 class="text-sm font-semibold">{recipeName}</h1>
			<p class="text-muted-foreground mt-1 text-xs">{recipeDescription}</p>
		</div>

		<!-- Process list -->
		<div class="border-b border-border p-3">
			<h2 class="text-muted-foreground mb-2 text-[10px] font-semibold uppercase tracking-wider">
				Processes
			</h2>
			<div class="flex flex-col gap-1">
				{#each processSources as src, i}
					<button
						type="button"
						class="w-full rounded px-3 py-1.5 text-left text-xs transition-colors {i ===
						selectedIndex
							? 'bg-sidebar-accent font-semibold'
							: 'hover:bg-sidebar-accent/50'}"
						onclick={() => (selectedIndex = i)}
					>
						{src.ordinal}. {src.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Stage list -->
		<div class="flex-1 overflow-y-auto p-3">
			<h2 class="text-muted-foreground mb-2 text-[10px] font-semibold uppercase tracking-wider">
				Stages
			</h2>
			<div class="flex flex-col gap-1">
				<button
					type="button"
					class="w-full rounded px-3 py-1.5 text-left text-xs transition-colors {selectedStageId ===
					null
						? 'bg-sidebar-accent font-semibold'
						: 'hover:bg-sidebar-accent/50'}"
					onclick={() => (selectedStageId = null)}
				>
					All stages
				</button>
				{#each sortedStages as stage}
					<button
						type="button"
						class="w-full rounded px-3 py-1.5 text-left text-xs transition-colors {selectedStageId ===
						stage.id
							? 'bg-sidebar-accent font-semibold'
							: 'hover:bg-sidebar-accent/50'}"
						onclick={() => (selectedStageId = stage.id)}
					>
						{stage.ordinal}. {stage.label}
					</button>
				{/each}
			</div>
		</div>
	</aside>

	<!-- Main panel -->
	<main class="flex-1 overflow-y-auto p-6">
		<!-- Process header -->
		<div class="mb-6">
			<h2 class="text-lg font-semibold">{selectedSnapshot.name}</h2>
			<div class="text-muted-foreground mt-1 flex items-baseline gap-3 text-xs">
				<span>{selectedSnapshot.processKind}</span>
				<span class="text-[10px] opacity-60">id={selectedSource.processSnapshotEntityId}</span>
			</div>
		</div>

		<!-- Stage cards -->
		{#each visibleStages as stage}
			<div class="bg-card mb-4 rounded-lg border p-4">
				<div class="flex items-baseline justify-between">
					<h3 class="font-semibold">
						Stage {stage.ordinal}: {stage.label}
						<span class="text-muted-foreground ml-2 text-xs font-normal">key={stage.key}</span>
					</h3>
					<span class="text-muted-foreground text-[10px] opacity-60">id={stage.id}</span>
				</div>

				<!-- Material slots -->
				{#if materialsForStage(stage.id).length > 0}
					<div class="mt-3">
						<h4
							class="text-muted-foreground mb-1.5 text-[10px] font-semibold uppercase tracking-wider"
						>
							Material Slots
						</h4>
						<div class="space-y-1">
							{#each materialsForStage(stage.id) as mat}
								<div class="flex items-baseline gap-2 text-xs">
									<span class="text-muted-foreground w-4 shrink-0 text-right"
										>{mat.ordinal}.</span
									>
									<span class="font-medium">{mat.label}</span>
									<span class="text-muted-foreground">—</span>
									<span class="text-muted-foreground">{mat.materialClass}</span>
									<span class="text-muted-foreground">/</span>
									<span class="text-muted-foreground">{mat.quantityMode}</span>
									{#if mat.quantityValue !== undefined}
										<span class="ml-auto tabular-nums"
											>{mat.quantityValue}{mat.quantityUnit ?? ''}</span
										>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Steps (grouped by section) -->
				{#each stepsForStage(stage.id) as step, i}
					{@const prevStep = i > 0 ? stepsForStage(stage.id)[i - 1] : null}
					{#if step.sectionLabel && step.sectionKey !== prevStep?.sectionKey}
						<div class="mt-4 ml-2">
							<h4 class="text-xs font-semibold">
								{step.sectionLabel}
								<span class="text-muted-foreground ml-1 font-normal">key={step.sectionKey}</span>
							</h4>
						</div>
					{/if}

					<div class="bg-muted/20 mt-2 rounded-md border p-3 {step.sectionKey ? 'ml-6' : 'ml-2'}">
						<div class="flex items-baseline justify-between">
							<div class="text-xs font-semibold">
								Step {step.ordinal}: {step.label}
							</div>
							<span class="text-muted-foreground text-[10px] opacity-60"
								>id={step.id}</span
							>
						</div>
						<div class="text-muted-foreground mt-1 text-xs">
							{step.instructionTemplate}
						</div>
						<div class="text-muted-foreground mt-0.5 flex gap-2 text-xs">
							<span>checkable: {step.isCheckable}</span>
							{#if step.scheduledOffsetH !== undefined}
								<span>&middot; offset: {step.scheduledOffsetH}h</span>
							{/if}
							{#if step.durationH !== undefined}
								<span>&middot; duration: {step.durationH}h</span>
							{/if}
						</div>

						<!-- Fields -->
						{#if fieldsForStep(step.id).length > 0}
							<div class="mt-2">
								<span
									class="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider"
									>Fields</span
								>
								<div class="mt-1 space-y-1">
									{#each fieldsForStep(step.id) as field}
										<div class="flex flex-wrap items-center gap-1.5 text-xs">
											<span class="text-muted-foreground">{field.ordinal}.</span>
											<span class="font-medium">{field.label}</span>
											<code
												class="bg-muted rounded px-1 py-0.5 text-[10px] leading-none"
												>{field.valueType}</code
											>
											{#if field.unit}
												<span class="text-muted-foreground">unit={field.unit}</span>
											{/if}
											<span class="text-muted-foreground"
												>default={defaultDisplay(field)}</span
											>
											{#if field.captureActualOnComplete}
												<span
													class="rounded bg-blue-500/15 px-1.5 py-0.5 text-[10px] leading-none text-blue-600 dark:text-blue-400"
													>capture</span
												>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</main>
</div>
