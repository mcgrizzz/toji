<script lang="ts">
	import { page } from '$app/stores';
	import { CircleUser, LogOut } from '@lucide/svelte';
	import { authClient } from '$lib/auth-client';
	import { resetAuthState } from '$lib/spacetimedb/connection';

	let user = $derived($page.data.user);
	let menuOpen = $state(false);

	function signIn(provider: 'discord' | 'github') {
		authClient.signIn.social({ provider, callbackURL: '/' });
	}

	function logout() {
		resetAuthState();
		authClient.signOut({ fetchOptions: { onSuccess: () => window.location.replace('/') } });
	}
</script>

<header class="flex items-center justify-between border-b px-4 py-2">
	<a href="/" class="text-sm font-light tracking-wide text-foreground">toji</a>

	{#if user}
		<div class="flex items-center gap-3">
			{#if user.image}
				<img
					src={user.image}
					alt=""
					class="h-6 w-6 rounded-full"
					title={user.name}
				/>
			{:else}
				<span title={user.name}>
					<CircleUser class="h-5 w-5 text-muted-foreground" />
				</span>
			{/if}
			<button
				onclick={logout}
				title="Sign out"
				class="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
			>
				<LogOut class="h-4 w-4" />
			</button>
		</div>
	{:else}
		<button
			onclick={() => (menuOpen = true)}
			class="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
		>
			Sign in
		</button>
	{/if}
</header>

{#if menuOpen}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		onkeydown={(e) => { if (e.key === 'Escape') menuOpen = false; }}
		onclick={(e) => { if (e.target === e.currentTarget) menuOpen = false; }}
	>
		<div
			role="dialog"
			aria-label="Sign in"
			class="flex w-72 flex-col gap-3 rounded-lg border border-border bg-popover p-6 shadow-lg"
		>
			<h2 class="text-center text-sm font-medium text-foreground">Sign in with</h2>
			<div class="flex flex-col gap-2">
				<button
					onclick={() => signIn('discord')}
					class="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
				>
					<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
					</svg>
					Discord
				</button>
				<button
					onclick={() => signIn('github')}
					class="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
				>
					<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
					</svg>
					GitHub
				</button>
			</div>
		</div>
	</div>
{/if}
