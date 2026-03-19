<script lang="ts">
	type Props = { current: 'engine' | 'processes' | 'plan' | 'schedule' };
	let { current }: Props = $props();

	const items = [
		{ key: 'engine', label: 'Engine', href: '/test-engine' },
		{ key: 'processes', label: 'Processes', href: '/test-processes' },
		{ key: 'plan', label: 'Plan', href: '/test-plan' },
		{ key: 'schedule', label: 'Schedule', href: '/test-schedule' }
	] as const;
</script>

<nav class="flex gap-3 border-b px-4 py-2 text-xs text-muted-foreground">
	{#each items as item}
		{#if item.key === current}
			<span class="font-semibold text-foreground">{item.label}</span>
		{:else}
			<a href={item.href} class="hover:text-foreground">{item.label}</a>
		{/if}
	{/each}
</nav>
