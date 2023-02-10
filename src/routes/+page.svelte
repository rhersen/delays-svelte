<script>
	export let data;
</script>

<ol>
	{#each data.trains as train}
		{#if train}
			<div>
				{train.description}
				{train.id}
				från {train.from} till {train.to}
				är {train.delay} sekunder sent i {train.location}
			</div>
		{/if}
	{/each}
</ol>
