export async function importJSON (jsonData) {
  const mutation = `
    mutation ImportJSON($details: [SchoolDatumInput]) {
      upsertManySchoolDatum(details: $details) {
        schoolId
        name
      }
    }
  `
  const vars = jsonData
  try {
    console.log('Begin try catch')
    const result = await fetch('http://localhost:3000/graphql', {
      method: 'POST',
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          details: vars
        }
      })
    })
    const data = await result.json()
    console.log('After try catch')
    console.log(data)

    return await data
  } catch (err) {
    console.error('Failed to import schools')
    console.error(err)
    return null
  } finally {
    console.log('Completed fetch POST')
  }
}
