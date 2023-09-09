import { json } from '@sveltejs/kit'
import { parseHTML } from 'linkedom'
import fs from 'fs'

export async function GET({ params, setHeaders }) {
	setHeaders({
		'Access-Control-Allow-Origin': '*',
		'Cache-Control': `public, s-maxage=${60 * 60 * 24 * 365}`,
	})

	const html = await getContributions(params)
	// following outputs static JSON rather than have a live API as github pages is a static site.
	// const contribs = parseContributions(html)
	// fs.writeFile('/Users/william/Data/data2023.json', JSON.stringify(contribs), function (err) {
	// 	if (err) throw err
	// 	console.log('File saved.')
	// })
	return json(parseContributions(html))
	// return json(contribs)
}

async function getContributions({ user, year }) {
	const api = `https://github.com/users/${user}/contributions?from=${year}-12-01&to=${year}-12-31`
	const response = await fetch(api)

	if (!response.ok) {
		throw new Error(`Failed to fetch: ${response.status}`)
	}

	return await response.text()
}

function parseContributions(html) {
	const { document } = parseHTML(html)

	const rows = document.querySelectorAll('tbody > tr')

	const contributions = []

	for (const row of rows) {
		const days = row.querySelectorAll('td:not(.ContributionCalendar-label)')

		const currentRow = []

		for (const day of days) {
			const data = day.innerText.split(' ')

			if (data.length > 1) {
				const contribution = {
					count: data[0] === 'No' ? 0 : +data[0],
					name: data[3].replace(',', ''),
					month: data[4],
					day: +data[5].replace(',', ''),
					year: +data[6],
					level: +day.dataset.level,
				}
				currentRow.push(contribution)
			} else {
				currentRow.push(null)
			}
		}

		contributions.push(currentRow)
	}

	return contributions
}
