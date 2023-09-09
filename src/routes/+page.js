// returns a JSON array of contributions for the specified user and year
// asynchronous call with 'awindest' = user and '2023' = year for the api parameters

export async function load({ fetch }) {
	const contributions = await (await fetch('awindest/2023')).json()
    // console.log(contributions)

	return { contributions }
}
