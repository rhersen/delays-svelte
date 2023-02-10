import { describe, expect, it, test } from 'vitest';
import trains from '$lib/trains.js';

describe('trains', () => {
	test('no announcements', () => {
		expect(trains()()).toEqual([]);
	});

	test('one announcement', () => {
		expect(
			trains(1676029080000)([
				{
					AdvertisedTimeAtLocation: '2023-02-10T12:38:00.000+01:00',
					AdvertisedTrainIdent: '1616',
					FromLocation: [{ LocationName: 'Hb', Priority: 1, Order: 0 }],
					LocationSignature: 'Baa',
					ProductInformation: [{ Code: 'PNA020', Description: 'Pågatågen' }],
					TimeAtLocationWithSeconds: '2023-02-10T12:42:30.000+01:00',
					ToLocation: [{ LocationName: 'För', Priority: 1, Order: 0 }]
				}
			])
		).toEqual([
			{
				id: '1616',
				description: 'Pågatågen',
				from: ['Helsingborg'],
				to: ['Förslöv'],
				delay: 270,
				location: 'Barkåkra',
				actual: '2023-02-10T12:42:30.000+01:00'
			}
		]);
	});

	it('throws away non-recent trains', () => {
		expect(
			trains(1676100000000)([
				{
					AdvertisedTimeAtLocation: '2023-02-10T12:38:00.000+01:00',
					AdvertisedTrainIdent: '1616',
					FromLocation: [{ LocationName: 'Hb', Priority: 1, Order: 0 }],
					LocationSignature: 'Baa',
					ProductInformation: [{ Code: 'PNA020', Description: 'Pågatågen' }],
					TimeAtLocationWithSeconds: '2023-02-10T12:42:30.000+01:00',
					ToLocation: [{ LocationName: 'För', Priority: 1, Order: 0 }]
				}
			])
		).toEqual([]);
	});

	test('three announcements', () => {
		expect(
			trains(1676030220000)([
				{
					AdvertisedTimeAtLocation: '2023-02-10T12:56:00.000+01:00',
					AdvertisedTrainIdent: '2131',
					FromLocation: [{ LocationName: 'Sl', Priority: 1, Order: 0 }],
					LocationSignature: 'Ksus',
					ProductInformation: [{ Code: 'PNA014', Description: 'Mälartåg' }],
					TimeAtLocationWithSeconds: '2023-02-10T12:56:57.000+01:00',
					ToLocation: [{ LocationName: 'Lp', Priority: 1, Order: 0 }]
				},
				{
					AdvertisedTimeAtLocation: '2023-02-10T12:56:00.000+01:00',
					AdvertisedTrainIdent: '133',
					LocationSignature: 'Sta',
					TimeAtLocationWithSeconds: '2023-02-10T12:57:02.000+01:00'
				},
				{
					AdvertisedTimeAtLocation: '2023-02-10T12:57:00.000+01:00',
					AdvertisedTrainIdent: '2835',
					FromLocation: [{ LocationName: 'Kän', Priority: 1, Order: 0 }],
					LocationSignature: 'Åbe',
					ProductInformation: [
						{ Code: 'PNA054', Description: 'SL Pendeltåg' },
						{ Code: 'PNA091', Description: '43' }
					],
					TimeAtLocationWithSeconds: '2023-02-10T12:57:08.000+01:00',
					ToLocation: [{ LocationName: 'Vhe', Priority: 1, Order: 0 }]
				}
			])
		).toEqual([
			{
				id: '2131',
				description: 'Mälartåg',
				from: ['Sala'],
				to: ['Linköping'],
				delay: 57,
				location: 'Kvicksund',
				actual: '2023-02-10T12:56:57.000+01:00'
			},
			{
				id: '2835',
				description: 'SL Pendeltåg',
				from: ['Kungsängen'],
				to: ['Västerhaninge'],
				delay: 8,
				location: 'Årstaberg',
				actual: '2023-02-10T12:57:08.000+01:00'
			}
		]);
	});

	test('two announcements per train', () => {
		expect(
			trains(1676033100000)([
				{
					AdvertisedTimeAtLocation: '2023-02-10T13:41:00.000+01:00',
					AdvertisedTrainIdent: '732',
					FromLocation: [{ LocationName: 'Cst', Priority: 1, Order: 0 }],
					LocationSignature: 'Arb',
					ProductInformation: [{ Code: 'PNA025', Description: 'SJ Regional' }],
					TimeAtLocationWithSeconds: '2023-02-10T13:42:42.000+01:00',
					ToLocation: [{ LocationName: 'Hpbg', Priority: 1, Order: 0 }]
				},
				{
					AdvertisedTimeAtLocation: '2023-02-10T13:43:00.000+01:00',
					AdvertisedTrainIdent: '732',
					LocationSignature: 'Jbk',
					TimeAtLocationWithSeconds: '2023-02-10T13:44:27.000+01:00'
				},
				{
					AdvertisedTimeAtLocation: '2023-02-10T13:42:00.000+01:00',
					AdvertisedTrainIdent: '1068',
					FromLocation: [{ LocationName: 'Dk.kh', Priority: 1, Order: 0 }],
					LocationSignature: 'Lu',
					ProductInformation: [{ Code: 'PNA044', Description: 'Öresundståg' }],
					TimeAtLocationWithSeconds: '2023-02-10T13:42:35.000+01:00',
					ToLocation: [{ LocationName: 'Ck', Priority: 1, Order: 0 }]
				},
				{
					AdvertisedTimeAtLocation: '2023-02-10T13:44:00.000+01:00',
					AdvertisedTrainIdent: '1068',
					LocationSignature: 'Thl',
					TimeAtLocationWithSeconds: '2023-02-10T13:44:34.000+01:00'
				}
			])
		).toEqual([
			{
				id: '732',
				description: 'SJ Regional',
				from: ['Stockholm C'],
				to: ['Hallsberg'],
				delay: 87,
				location: 'Jädersbruk',
				actual: '2023-02-10T13:44:27.000+01:00'
			},
			{
				id: '1068',
				description: 'Öresundståg',
				from: ['Köpenhamn H'],
				to: ['Karlskrona'],
				delay: 34,
				location: 'Tornhill',
				actual: '2023-02-10T13:44:34.000+01:00'
			}
		]);
	});
});
