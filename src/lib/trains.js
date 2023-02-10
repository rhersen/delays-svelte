import { find, groupBy, last, map } from 'lodash/fp.js';
import locations from '$lib/short.json';

export default function trains(trainAnnouncement) {
	return map(groupToTrain)(
		Object.values(groupBy('AdvertisedTrainIdent')(map(transformAnnouncement)(trainAnnouncement)))
	);
}

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
