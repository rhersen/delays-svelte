import { error } from '@sveltejs/kit';
import { find, groupBy, last, map } from 'lodash/fp';
import locations from '$lib/short.json';
import snapshot from '$lib/16.json';

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

function trains(trainAnnouncement) {
	return map(groupToTrain)(
		Object.values(groupBy('AdvertisedTrainIdent')(map(transformAnnouncement)(trainAnnouncement)))
	);

	function groupToTrain(announcements) {
		const advertised = find((value) => value.description)(announcements);
		const latest = last(announcements);
		return advertised
			? {
					id: advertised.AdvertisedTrainIdent,
					description: advertised.description,
					from: advertised.from,
					to: advertised.to,
					delay: latest.delay,
					location: latest.location,
					announcements
			  }
			: undefined;
	}

	function transformAnnouncement({
		AdvertisedTimeAtLocation,
		AdvertisedTrainIdent,
		FromLocation,
		LocationSignature,
		ProductInformation,
		ToLocation,
		TimeAtLocationWithSeconds
	}) {
		const delay =
			(Date.parse(TimeAtLocationWithSeconds) - Date.parse(AdvertisedTimeAtLocation)) * 1e-3;
		const description = ProductInformation?.[0].Description;
		const location = locations[LocationSignature] ?? LocationSignature;
		const from = FromLocation?.map(name);
		const to = ToLocation?.map(name);
		return {
			delay,
			AdvertisedTrainIdent,
			location,
			from,
			description,
			to,
			TimeAtLocationWithSeconds
		};
	}

	function name({ LocationName }) {
		return locations[LocationName] ?? locations;
	}
}
