import { error } from '@sveltejs/kit';
import { map, orderBy } from 'lodash/fp';
import locations from '$lib/short.json';

export const load = async () => {
	const r = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
		method: 'POST',
		body: getBody(),
		headers: {
			'Content-Type': 'application/xml',
			Accept: 'application/json'
		}
	});
	if (!r.ok) throw error(r.status, r.statusText);

	const { RESPONSE } = await r.json();
	const [announcements] = RESPONSE.RESULT;

	return {
		announcements: orderBy('delay', 'desc')(map(transform)(announcements.TrainAnnouncement))
	};

	function transform({
		AdvertisedTimeAtLocation,
		AdvertisedTrainIdent,
		FromLocation,
		ProductInformation,
		ToLocation,
		TimeAtLocationWithSeconds
	}) {
		const delay =
			(Date.parse(TimeAtLocationWithSeconds) - Date.parse(AdvertisedTimeAtLocation)) * 1e-3;
		const description = ProductInformation?.[0].Description;

		const from = FromLocation?.map(name);
		const to = ToLocation?.map(name);
		return { delay, AdvertisedTrainIdent, from, description, to };
	}

	function name({ LocationName }) {
		return locations[LocationName] ?? locations;
	}
};

function getBody() {
	const now = Date.now();
	const since = new Date(now - 8 * 6e4).toISOString();
	return `
<REQUEST>
  <LOGIN authenticationkey='${process.env.TRAFIKVERKET_API_KEY}' />
     <QUERY objecttype='TrainAnnouncement' orderby='AdvertisedTimeAtLocation' schemaversion='1.6'>
      <FILTER>
         <AND>
            <EQ name='ActivityType' value='Avgang' />
            <EQ name='Advertised' value='true' />
            <GT name='TimeAtLocationWithSeconds' value='${since}' />
         </AND>
      </FILTER>
      <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
      <INCLUDE>AdvertisedTrainIdent</INCLUDE>
      <INCLUDE>Deviation</INCLUDE>
      <INCLUDE>EstimatedTimeAtLocation</INCLUDE>
      <INCLUDE>FromLocation</INCLUDE>
      <INCLUDE>ProductInformation</INCLUDE>
      <INCLUDE>TimeAtLocation</INCLUDE>
      <INCLUDE>TimeAtLocationWithSeconds</INCLUDE>
      <INCLUDE>ToLocation</INCLUDE>
      <INCLUDE>TrackAtLocation</INCLUDE>
     </QUERY>
</REQUEST>`;
}
