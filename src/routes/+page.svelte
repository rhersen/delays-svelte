<script>
	export let data;
</script>

<ul>
	{#each data.announcements as { delay, AdvertisedTrainIdent, from, description, to }}
		<li>
			{delay}
			{description}
			{AdvertisedTrainIdent}
			från {from}
			till {to}
		</li>
	{/each}
</ul>
