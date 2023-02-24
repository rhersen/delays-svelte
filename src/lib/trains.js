import { compact, find, groupBy, last, map, orderBy } from 'lodash/fp.js';
import locations from '$lib/short.json';

export default (now) => (announcements) => {
	return orderBy(
		'delay',
		'desc'
	)(
		compact(
			map(groupToTrain(now))(
				groupBy('AdvertisedTrainIdent')(map(transformAnnouncement)(announcements))
			)
		)
	);
};

function groupToTrain(now) {
	return (announcements) => {
		const advertised = find(({ description }) => description)(announcements);
		const latest = last(announcements);

		if (advertised) {
			const actual = latest.TimeAtLocationWithSeconds;
			if (now - new Date(actual) < 1000000 && latest.delay > 1.5)
				return {
					id: advertised.AdvertisedTrainIdent,
					description: advertised.description,
					from: advertised.from,
					to: advertised.to,
					delay: latest.delay,
					location: latest.location,
					reason: latest.Deviation
						? map(({ Description }) => Description)(latest.Deviation)
						: undefined,
					actual
				};
		}
	};
}

function transformAnnouncement({
	AdvertisedTimeAtLocation,
	AdvertisedTrainIdent,
	Deviation,
	FromLocation,
	LocationSignature,
	ProductInformation,
	ToLocation,
	TimeAtLocationWithSeconds
}) {
	return {
		delay: (Date.parse(TimeAtLocationWithSeconds) - Date.parse(AdvertisedTimeAtLocation)) / 60000,
		AdvertisedTrainIdent,
		Deviation,
		location: locations[LocationSignature] ?? LocationSignature,
		from: FromLocation?.map(name),
		description: ProductInformation?.[0].Description,
		to: ToLocation?.map(name),
		TimeAtLocationWithSeconds
	};
}

function name({ LocationName }) {
	return locations[LocationName] ?? locations;
}
