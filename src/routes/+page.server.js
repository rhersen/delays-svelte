import { error } from '@sveltejs/kit';
import snapshot from '$lib/16.json';
import trains from '$lib/trains.js';

// noinspection JSUnusedGlobalSymbols
export const load = async () => {
	const trainAnnouncement = !process.env.TRAFIKVERKET_API_KEY
		? snapshot
		: await fetchAnnouncements();
	return {
		trains: trains(trainAnnouncement)
	};
};

async function fetchAnnouncements() {
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
	return announcements.TrainAnnouncement;
}

function getBody() {
	const now = Date.now();
	const since = new Date(now - 64 * 6e4).toISOString();
	return `
<REQUEST>
  <LOGIN authenticationkey='${process.env.TRAFIKVERKET_API_KEY}' />
     <QUERY objecttype='TrainAnnouncement' orderby='AdvertisedTimeAtLocation' schemaversion='1.6'>
      <FILTER>
         <AND>
            <EQ name='ActivityType' value='Avgang' />
            <GT name='TimeAtLocationWithSeconds' value='${since}' />
         </AND>
      </FILTER>
      <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
      <INCLUDE>AdvertisedTrainIdent</INCLUDE>
      <INCLUDE>FromLocation</INCLUDE>
      <INCLUDE>LocationSignature</INCLUDE>
      <INCLUDE>ProductInformation</INCLUDE>
      <INCLUDE>TimeAtLocationWithSeconds</INCLUDE>
      <INCLUDE>ToLocation</INCLUDE>
     </QUERY>
</REQUEST>`;
}
