<script lang="ts">
	import { resolvePlan } from '$lib/engine/resolvers/resolvePlan';
	import { resolveSchedule } from '$lib/engine/resolvers/resolveSchedules';
	import { sakuraGinjoPlan, sakuraGinjoPresets } from '$lib/engine/fixtures/testPlanInput';
	import { exampleKojiSchedule } from '$lib/engine/fixtures/testScheduleInput';

	const bill = resolvePlan(sakuraGinjoPlan, sakuraGinjoPresets);
	const schedule = resolveSchedule(exampleKojiSchedule, '2026-03-15T08:00:00', bill);

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
		const h = ms / 3_600_000;
		if (h < 1) return `${Math.round(h * 60)}m`;
		return `${h}h`;
	}
</script>

<div class="mx-auto max-w-5xl space-y-6 p-4">
	<div>
		<h1 class="text-lg font-semibold">Schedule Debug — {schedule.name}</h1>
		<p class="text-sm text-muted-foreground">
			Workflow: <strong>{schedule.workflow}</strong> · {schedule.steps.length} steps · Start: Mar 15, 08:00
		</p>
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
						<th class="px-4 py-2">Goals / Checks</th>
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
		{#if step.observationPrompt || step.notes || step.actions}
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
					{#if step.observationPrompt}
						<div>
							<p class="text-xs font-semibold text-muted-foreground mb-1">
								Observation Prompt{step.observationPrompt.required ? ' (required)' : ''}
							</p>
							<p class="font-mono text-xs">{step.observationPrompt.fieldKeys.join(', ')}</p>
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
</div>
