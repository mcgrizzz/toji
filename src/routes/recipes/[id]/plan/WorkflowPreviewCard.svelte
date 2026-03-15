<script lang="ts">
	import type { ScheduleTemplate } from '$lib/engine/models/scheduleTypes';
	import { buildSchedulePreview } from '$lib/engine/resolvers/formatSchedulePreview';

	type Props = {
		template: ScheduleTemplate;
	};

	let { template }: Props = $props();

	const steps = $derived(buildSchedulePreview(template.steps));
</script>

<section class="rounded-lg border bg-background" aria-labelledby="heading-schedule-{template.workflow.kind}">
	<div class="border-b px-4 py-2">
		<h2 id="heading-schedule-{template.workflow.kind}" class="text-sm font-semibold">{template.name}</h2>
		<p class="text-xs text-muted-foreground">
			{steps.length} steps
		</p>
	</div>
	<div class="overflow-x-auto">
		<table class="w-full text-sm">
			<caption class="sr-only">{template.name} schedule steps</caption>
			<thead>
				<tr class="border-b text-left text-xs text-muted-foreground">
					<th class="w-8 px-4 py-2">#</th>
					<th class="px-4 py-2">Step</th>
					<th class="px-4 py-2">Offset</th>
					<th class="px-4 py-2">Duration</th>
					<th class="px-4 py-2">Targets</th>
				</tr>
			</thead>
			<tbody>
				{#each steps as step, i}
					<tr class="border-b">
						<td class="px-4 py-2 text-muted-foreground">{i + 1}</td>
						<td class="px-4 py-2 font-medium">{step.label}</td>
						<td class="px-4 py-2 font-mono text-xs">{step.offsetLabel}</td>
						<td class="px-4 py-2 font-mono text-xs">{step.durationLabel ?? '—'}</td>
						<td class="px-4 py-2 text-xs">
							{#if step.goals}
								{#each step.goals as goal}
									<span
										class="mr-2 inline-block rounded bg-success/15 px-1.5 py-0.5 text-success-foreground dark:bg-success/20 dark:text-success-foreground"
									>{goal}</span>
								{/each}
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>
