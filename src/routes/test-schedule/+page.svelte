<script lang="ts">
	import { onMount } from 'svelte';
	import { getLibraryEntries, getRecipeBundle, type LibraryEntry } from '$lib/services/libraryService';
	import type { RecipeBundle } from '$lib/app/types';
	import type { WorkflowKind } from '$lib/engine/models/scheduleTypes';
	import { resolveSchedule, type ResolvedSchedule } from '$lib/engine/resolvers/resolveSchedules';

	let entries = $state<LibraryEntry[]>([]);
	let bundle = $state<RecipeBundle | null>(null);
	let loading = $state(true);
	let loadingBundle = $state(false);
	let error = $state('');
	let selectedSnapshotId = $state('');
	let selectedWorkflow = $state<WorkflowKind | ''>('');
	let schedule = $state<ResolvedSchedule | null>(null);
	let startTime = $state('2026-03-15T08:00:00');

	let availableWorkflows = $derived(
		bundle ? (Object.keys(bundle.schedules) as WorkflowKind[]).filter((k) => bundle!.schedules[k]) : []
	);

	onMount(async () => {
		try {
			entries = await getLibraryEntries();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			loading = false;
		}
	});

	async function loadBundle(snapshotId: string) {
		selectedSnapshotId = snapshotId;
		bundle = null;
		schedule = null;
		selectedWorkflow = '';
		if (!snapshotId) return;
		loadingBundle = true;
		error = '';
		try {
			bundle = await getRecipeBundle(snapshotId);
			// Auto-select first workflow if available
			const workflows = Object.keys(bundle.schedules) as WorkflowKind[];
			const first = workflows.find((k) => bundle!.schedules[k]);
			if (first) {
				selectedWorkflow = first;
				resolveSelected(first);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
			bundle = null;
		} finally {
			loadingBundle = false;
		}
	}

	function resolveSelected(kind: WorkflowKind | '' = selectedWorkflow) {
		if (!bundle || !kind) {
			schedule = null;
			return;
		}
		const template = bundle.schedules[kind as WorkflowKind];
		if (!template) {
			schedule = null;
			return;
		}
		schedule = resolveSchedule(template, startTime);
	}

	function selectWorkflow(kind: string) {
		selectedWorkflow = kind as WorkflowKind;
		resolveSelected(kind as WorkflowKind);
	}

	function updateStartTime(value: string) {
		startTime = value;
		resolveSelected();
	}

	function fmtTime(iso: string) {
		const d = new Date(iso);
		return d.toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
	}

	function duration(start: string, end?: string) {
		if (!end) return '—';
		const ms = new Date(end).getTime() - new Date(start).getTime();
		const totalMinutes = Math.round(ms / 60_000);
		const h = Math.floor(totalMinutes / 60);
		const m = totalMinutes % 60;
		if (h === 0) return `${m}m`;
		if (m === 0) return `${h}h`;
		return `${h}h ${m}m`;
	}
</script>

<nav class="flex gap-3 border-b px-4 py-2 text-xs text-muted-foreground">
	<a href="/test-engine" class="hover:text-foreground">Engine</a>
	<a href="/test-processes" class="hover:text-foreground">Processes</a>
	<a href="/test-plan" class="hover:text-foreground">Plan</a>
	<span class="font-semibold text-foreground">Schedule</span>
</nav>

<div class="mx-auto max-w-5xl space-y-6 p-4">
	<div>
		<h1 class="text-lg font-semibold">Schedule Debug</h1>
		<p class="text-sm text-muted-foreground">Resolve schedule templates from DB-backed recipe bundles.</p>
	</div>

	{#if loading}
		<p class="text-sm text-muted-foreground">Loading library...</p>
	{:else if error && !bundle}
		<p class="text-sm text-destructive">{error}</p>
	{:else if entries.length === 0}
		<p class="text-sm text-muted-foreground">No seeded data found. Run <code>seedDemoData</code> first.</p>
	{:else}
		<!-- Library picker -->
		<div class="flex flex-wrap gap-4">
			<div class="flex-1 min-w-[200px]">
				<label for="entry-picker" class="text-xs font-medium text-muted-foreground">Recipe</label>
				<select
					id="entry-picker"
					class="mt-1 block w-full rounded border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
					value={selectedSnapshotId}
					onchange={(e) => loadBundle(e.currentTarget.value)}
				>
					<option value="">Select a recipe...</option>
					{#each entries as entry}
						<option value={entry.snapshotId}>{entry.name} (v{entry.version})</option>
					{/each}
				</select>
			</div>

			{#if bundle && availableWorkflows.length > 0}
				<div>
					<label for="workflow-picker" class="text-xs font-medium text-muted-foreground">Workflow</label>
					<select
						id="workflow-picker"
						class="mt-1 block w-full rounded border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
						value={selectedWorkflow}
						onchange={(e) => selectWorkflow(e.currentTarget.value)}
					>
						{#each availableWorkflows as kind}
							<option value={kind}>{kind}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="start-time" class="text-xs font-medium text-muted-foreground">Start time</label>
					<input
						id="start-time"
						type="datetime-local"
						class="mt-1 block rounded border bg-background px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-ring"
						value={startTime.slice(0, 16)}
						onchange={(e) => updateStartTime(e.currentTarget.value + ':00')}
					/>
				</div>
			{/if}
		</div>

		{#if loadingBundle}
			<p class="text-sm text-muted-foreground">Loading bundle...</p>
		{:else if error}
			<p class="text-sm text-destructive">{error}</p>
		{:else if bundle && availableWorkflows.length === 0}
			<p class="text-sm text-muted-foreground">No schedules defined in this recipe bundle.</p>
		{:else if schedule}
			<!-- Schedule header -->
			<div class="text-sm text-muted-foreground">
				<strong>{schedule.name}</strong> · {schedule.workflow} · {schedule.steps.length} steps
			</div>

			<!-- Timeline table -->
			<section class="rounded-lg border bg-background">
				<div class="border-b px-4 py-2">
					<h2 class="text-sm font-semibold">Steps</h2>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b text-left text-xs text-muted-foreground">
								<th class="px-4 py-2 w-8">#</th>
								<th class="px-4 py-2">Step</th>
								<th class="px-4 py-2">Start</th>
								<th class="px-4 py-2">Duration</th>
								<th class="px-4 py-2">Targets</th>
							</tr>
						</thead>
						<tbody>
							{#each schedule.steps as step, i}
								<tr class="border-b">
									<td class="px-4 py-2 text-muted-foreground">{i + 1}</td>
									<td class="px-4 py-2 font-medium">{step.label}</td>
									<td class="px-4 py-2 font-mono text-xs">{fmtTime(step.startAt)}</td>
									<td class="px-4 py-2 font-mono text-xs">{duration(step.startAt, step.endAt)}</td>
									<td class="px-4 py-2 text-xs">
										{#if step.goals}
											{#each step.goals as goal}
												<span class="mr-2 inline-block rounded bg-green-100 px-1.5 py-0.5 text-green-800 dark:bg-green-900/30 dark:text-green-300">{goal}</span>
											{/each}
										{/if}
										{#if step.checks}
											{#each step.checks as check}
												<span class="mr-2 inline-block rounded bg-yellow-100 px-1.5 py-0.5 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">{check}</span>
											{/each}
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>

			<!-- Step details -->
			{#each schedule.steps as step, i}
				{#if step.notes || step.actions}
					<section class="rounded-lg border bg-background">
						<div class="border-b px-4 py-2">
							<h2 class="text-sm font-semibold">{i + 1}. {step.label}</h2>
							<p class="text-xs text-muted-foreground font-mono">{fmtTime(step.startAt)}{step.endAt ? ` → ${fmtTime(step.endAt)}` : ''}</p>
						</div>
						<div class="p-4 space-y-3 text-sm">
							{#if step.actions}
								<div>
									<p class="text-xs font-semibold text-muted-foreground mb-1">Actions</p>
									<ul class="list-disc list-inside space-y-0.5">
										{#each step.actions as action}
											<li>{action}</li>
										{/each}
									</ul>
								</div>
							{/if}
							{#if step.notes}
								<div>
									<p class="text-xs font-semibold text-muted-foreground mb-1">Notes</p>
									<ul class="list-disc list-inside space-y-0.5 text-muted-foreground">
										{#each step.notes as note}
											<li>{note}</li>
										{/each}
									</ul>
								</div>
							{/if}
						</div>
					</section>
				{/if}
			{/each}

			<!-- Raw JSON -->
			<section class="rounded-lg border bg-background">
				<div class="border-b px-4 py-2">
					<h2 class="text-sm font-semibold">ResolvedSchedule (raw JSON)</h2>
				</div>
				<div class="p-3">
					<pre class="max-h-[50vh] overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs leading-5">{JSON.stringify(schedule, null, 2)}</pre>
				</div>
			</section>
		{/if}
	{/if}
</div>
