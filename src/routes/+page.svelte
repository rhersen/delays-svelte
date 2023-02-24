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
				är {Math.round(train.delay)} minuter sent i {train.location}
				{train.reason ? `pga ${train.reason}` : ''}
			</li>
		{/if}
	{/each}
</ol>
