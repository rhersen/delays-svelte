<script>
	export let data;
</script>

<h1>Sveriges mest försenade tåg just nu</h1>

<ol>
	{#each data.trains as train}
		{#if train}
			<li>
				{train.description}
				{train.id}
				från {train.from} till {train.to}
				är {train.delay} sekunder sent i {train.location}
			</li>
		{/if}
	{/each}
</ol>
