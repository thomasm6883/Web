/* eslint-disable no-useless-escape */
import puppeteer from 'puppeteer'
import fs from 'fs'
import { importJSON } from './datahelperGraphql.js'
import Worker from 'web-worker'

// Wisconsin Schools
export async function collectSchoolsWI () {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false
  })
  const page = await browser.newPage()

  const allSchools = []
  let newData = null
  // there are ids between 5000 and ~5600 that may or may not be usually accessible in the
  // website without editing the url and usually have no data so they are not included
  for (let i = 1; i < 600; i++) {
    console.log(i)
    try {
      newData = await wisconsinPuppet(i, page)
    } catch (e) {
      if (e instanceof puppeteer.errors.TimeoutError) {
        console.log(`School with code ${i} failed to load and timed out.`)
      }
    }
    if (newData) { allSchools.push(newData) }
    if (i % 50 === 0) {
      console.log('importing schools')
      importJSON(allSchools)
      allSchools.length = 0
    }
  }
  // not sure why these exist but they have relevant data (currently between 2845 and 2891)
  for (let i = 2845; i < 2900; i++) {
    try {
      newData = await wisconsinPuppet(i, page)
    } catch (e) {
      if (e instanceof puppeteer.errors.TimeoutError) {
        console.log(`School with code ${i} failed to load and timed out.`)
      }
    }
    if (newData) { allSchools.push(newData) }
  }
  console.log('importing schools')
  importJSON(allSchools)
  allSchools.length = 0
  // fs.writeFileSync('server/schoolDataWI.json', JSON.stringify(allSchools, null, 2), { encoding: 'utf8' })
  browser.close()
}

async function wisconsinPuppet (i, page) {
  if (i % 30 === 0) { setTimeout(() => { console.log('delaying 5 seconds') }, 5000) }
  await page.goto(`https://schools.wiaawi.org/Directory/School/GetDirectorySchool?orgID=${i}`)
  const t = await page.$('.JumboMain')
  const name = await (await t.getProperty('textContent')).jsonValue()
  if (name) {
    const pageData = await page.content()
    let level = String(pageData).match(/Level<\/span>\s+<h5 class="headingRemovePad">(?<level>[\w\-/' ]+)<\/h5>/ms)
    try {
      if (level.groups.level) { /* */ }
    } catch (err) {
      level = {
        groups: {
          level: ' '
        }
      }
    }
    if (level.groups.level === 'High School') {
      const WILocaleData = collectSchoolInfoWI(pageData)
      const WIPersonalData = collectPeopleWI(pageData)
      const allData = {
        schoolId: 'W' + parseInt(i),
        name,
        ...WILocaleData,
        ...WIPersonalData

      }
      return allData
    }
  }
}

function collectSchoolInfoWI (pageData) {
  // eslint-disable-next-line no-useless-escape
  const address = String(pageData).match(/Address<\/span>\s+<h5 class="headingRemovePad">(?<streetAdr>[\w\-&.,;/#' ]+)<\/h5>/ms)
  let mailing = String(pageData).match(/Address2<\/span>\s+<h5 class="headingRemovePad">(?<mailing>[\w\-&.;' ]+)<\/h5>/ms)
  const city = String(pageData).match(/City<\/span>\s+<h5 class="headingRemovePad">(?<city>[\w\-&.;' ]+)<\/h5>/ms)
  const zip = String(pageData).match(/Zip<\/span>\s+<h5 class="headingRemovePad">(?<zip>[-\d ]+)<\/h5>/ms)
  let phone = String(pageData).match(/Phone<\/span>\s+<h5 class="headingRemovePad">(?<phone>[\d()-\. ]+)<\/h5>/ms)

  // after collection, validate matches
  try {
    if (phone.groups.phone) { /* */ }
  } catch (err) {
    phone = {
      groups: {
        phone: ' '
      }
    }
  }

  try {
    if (mailing.groups.mailing) { /* */ }
  } catch (err) {
    mailing = {
      groups: {
        mailing: ' '
      }
    }
  }

  return ({
    street: address.groups.streetAdr,
    mailing: mailing.groups.mailing,
    state: 'WI',
    city: city.groups.city,
    zip: zip.groups.zip,
    phone: phone.groups.phone
  })
}

function collectPeopleWI (text) {
  let ADs = String(text).match(/.+>Athletic Director.+\n.+\n.+<b>(?<firstname>[-\w ]+)<span>&nbsp;<\/span>(?<lastname>[-\w ]+).+\n\n.+\n.+\n.+<b>(?<email>[-\w.@\d]+)/m)
  let ADName
  try {
    ADName = ADs.groups.firstname + ' ' + ADs.groups.lastname
  } catch (err) {
    try {
      ADName = ADs.groups.firstname
    } catch (err) {
      ADName = ''
    }
  }
  try {
    if (ADs.groups.email) { /* */ }
  } catch (err) {
    ADs = {
      groups: {
        email: ''
      }
    }
  }

  let re = /Boys Cross Country.+\n.+\n.+<b>(?<first>[-\w]+)<span>.+<\/span>(?<last>[-\w]+)?.+\n.+\n.+\n.+\n.+(?:mailto:(?<address>[_\w\d@.]+))/gm
  const boysXC = {
    groups: {
      name: '',
      address: ''
    }
  }
  let tempBoysXC
  let tempName = ''
  while ((tempBoysXC = re.exec(String(text))) !== null) {
    try {
      tempName = tempBoysXC[1] + ' ' + tempBoysXC[2]
      boysXC.groups.address += (tempBoysXC[3] + '; ')
    } catch (err) {
      tempName = tempBoysXC[1]
      boysXC.groups.address += (tempBoysXC[2] + ';')
    }
    boysXC.groups.name += (tempName + '; ')
  }
  boysXC.groups.address = boysXC.groups.address.replace(/;\s*$/, '')
  boysXC.groups.name = boysXC.groups.name.replace(/;\s*$/, '')

  re = /Girls Cross Country.+\n.+\n.+<b>(?<first>[-\w]+)<span>.+<\/span>(?<last>[-\w]+)?.+\n.+\n.+\n.+\n.+(?:mailto:(?<address>[_\w\d@.]+))/gm
  const girlsXC = {
    groups: {
      name: '',
      address: ''
    }
  }
  let tempGirlsXC
  while ((tempGirlsXC = re.exec(String(text))) !== null) {
    try {
      tempName = tempGirlsXC[1] + ' ' + tempGirlsXC[2]
      girlsXC.groups.address += (tempGirlsXC[3] + '; ')
    } catch (err) {
      try {
        tempName = tempGirlsXC[1]
        girlsXC.groups.address += (tempGirlsXC[2] + ';')
      } catch (err) {
        // tempGirlsXC[1] does not exist or there is no address
        girlsXC.groups.address = ''
      }
    }
    girlsXC.groups.name += (tempName + '; ')
  }
  girlsXC.groups.address = girlsXC.groups.address.replace(/;\s*$/, '')
  girlsXC.groups.name = girlsXC.groups.name.replace(/;\s*$/, '')

  re = /Girls Track.+\n.+\n.+<b>(?<first>[-\w]+)<span>.+<\/span>(?<last>[-\w]+)?.+\n.+\n.+\n.+\n.+(?:mailto:(?<address>[_\w\d@.]+))/gm
  const girlsTF = {
    groups: {
      name: '',
      address: ''
    }
  }
  let tempGirlsTF
  while ((tempGirlsTF = re.exec(String(text))) !== null) {
    try {
      tempName = tempGirlsTF[1] + ' ' + tempGirlsTF[2]
      girlsTF.groups.address += (tempGirlsTF[3] + '; ')
    } catch (err) {
      try {
        tempName = tempGirlsTF[1]
        girlsTF.groups.address += (tempGirlsTF[2] + ';')
      } catch (err) {
        // tempGirlsTF[1] does not exist or there is no address
        girlsTF.groups.address = ''
      }
    }
    girlsTF.groups.name += (tempName + '; ')
  }
  girlsTF.groups.address = girlsTF.groups.address.replace(/;\s*$/, '')
  girlsTF.groups.name = girlsTF.groups.name.replace(/;\s*$/, '')

  re = /Boys Track.+\n.+\n.+<b>(?<first>[-\w]+)<span>.+<\/span>(?<last>[-\w]+)?.+\n.+\n.+\n.+\n.+(?:mailto:(?<address>[_\w\d@.]+))/gm
  const boysTF = {
    groups: {
      name: '',
      address: ''
    }
  }
  let tempBoysTF
  while ((tempBoysTF = re.exec(String(text))) !== null) {
    try {
      tempName = tempBoysTF[1] + ' ' + tempBoysTF[2]
      boysTF.groups.address += (tempBoysTF[3] + '; ')
    } catch (err) {
      try {
        tempName = tempBoysTF[1]
        boysTF.groups.address += (tempBoysTF[2] + ';')
      } catch (err) {
        // tempBoysTF[1] does not exist or there is no address
        boysTF.groups.address = ''
      }
    }
    boysTF.groups.name += (tempName + '; ')
  }
  boysTF.groups.address = boysTF.groups.address.replace(/;\s*$/, '')
  boysTF.groups.name = boysTF.groups.name.replace(/;\s*$/, '')
  return ({
    ad: {
      name: ADName,
      address: ADs.groups.email
    },
    boysCross: {
      name: boysXC.groups.name,
      address: boysXC.groups.address
    },
    boysTrack: {
      name: boysTF.groups.name,
      address: boysTF.groups.address
    },
    girlsCross: {
      name: girlsXC.groups.name,
      address: girlsXC.groups.address
    },
    girlsTrack: {
      name: girlsTF.groups.name,
      address: girlsTF.groups.address
    }
  })
}

// Illinois Schools
export async function collectSchoolsIL () {
  // initialize a puppet
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false
  })
  const page = await browser.newPage()

  const allSchools = []

  let notFound = 0
  for (let i = 1; i <= 30; i++) {
    for (let j = 1; j <= 99; j++) {
      if (j % 30 === 0) { setTimeout(() => { console.log('delaying 5 seconds') }, 5000) }
      const tempi = i.toString().padStart(2, '0')
      const tempj = j.toString().padStart(2, '0')
      const id = tempi + '' + tempj
      await page.goto(`https://www.ihsa.org/data/school/schools/${id}.htm`)

      const t = await page.$('title')
      const text = await (await t.getProperty('textContent')).jsonValue()
      if (text === 'Page Not Found') {
        if (notFound > 5) { break }
        notFound++
      } else {
        notFound = 0
        const text = await page.content()
        const peopleData = collectPeopleIL(text, id)
        const schoolData = collectSchoolInfoIL(text)
        const allData = {
          schoolId: 'I' + parseInt(id),
          ...peopleData,
          ...schoolData
        }
        allSchools.push(allData)
      }
    }
    console.log('importing schools')
    importJSON(allSchools)
    allSchools.length = 0
  }

  // fs.writeFileSync('server/schoolDataIL.json', JSON.stringify(allSchools, null, 2), { encoding: 'utf8' })
  browser.close()
}

function collectSchoolInfoIL (text) {
  // eslint-disable-next-line no-useless-escape
  const name = String(text).match(/<h1>(?<name>[\w \(\)-\.&;'\/éç]+)<\/h1>/)
  let address = String(text).match(/<p class="nospace">.(?<streetAdr>[\w\-&.;' ]+)(?:, |, R.R. 1, )?(?<mailing>[\w\-. ]+)? \(.*<\/p>/ms)
  const area = String(text).match(/<p class="nospace">\n(?<city>[\w\-.'&; ]+), IL {2}(?<zip>[\d-]+)\n<\/p>/ms)
  let phone = String(text).match(/<p class="nospace">\nPhone: (?<phone>[\d-]+)(?:[x\d ]+)?\n<\/p>/)

  try {
    if (phone.groups.phone) { /* */ }
  } catch (err) {
    phone = {
      groups: {
        phone: ' '
      }
    }
  }

  try {
    if (address.groups.mailing) { /* */ }
  } catch (err) {
    address = {
      groups: {
        streetAdr: address.groups.streetAdr,
        mailing: ''
      }
    }
  }

  return ({
    name: name.groups.name,
    street: address.groups.streetAdr,
    mailing: address.groups.mailing,
    state: 'IL',
    city: area.groups.city,
    zip: area.groups.zip,
    phone: phone.groups.phone
  })
}

function collectPeopleIL (text, id) {
  let ADs = String(text).match(/<b>[\w ]+Athletic Director<\/b>: (?<name>[\w ]+) &.*mailto:(?<address>.+)"/m)
  // console.log(id)
  let re = /<b>Boys Cross Country Head Coach<\/b>: (?<name>[\w ]+) &.*mailto:(?<address>.+)?"/gm
  let tempBoysXC

  let boysXC = {
    groups: {
      name: '',
      address: ''
    }
  }
  while ((tempBoysXC = re.exec(String(text))) !== null) {
    boysXC.groups.name += (tempBoysXC[1] + '; ')
    boysXC.groups.address += (tempBoysXC[2] + '; ')
  }
  boysXC.groups.address = boysXC.groups.address.replace(/;\s*$/, '')
  boysXC.groups.name = boysXC.groups.name.replace(/;\s*$/, '')

  re = /<b>Girls Cross Country Head Coach<\/b>: (?<name>[\w ]+) &.*mailto:(?<address>.+)"/gm
  let tempGirlsXC
  let girlsXC = {
    groups: {
      name: '',
      address: ''
    }
  }
  while ((tempGirlsXC = re.exec(String(text))) !== null) {
    girlsXC.groups.name += (tempGirlsXC[1] + '; ')
    girlsXC.groups.address += (tempGirlsXC[2] + '; ')
  }
  girlsXC.groups.address = girlsXC.groups.address.replace(/;\s*$/, '')
  girlsXC.groups.name = girlsXC.groups.name.replace(/;\s*$/, '')

  re = /<b>Boys Track.*<\/b>: (?<name>[\w ]+) &.*mailto:(?<address>.+)"/gm
  let tempBoysTF
  let boysTF = {
    groups: {
      name: '',
      address: ''
    }
  }
  while ((tempBoysTF = re.exec(String(text))) !== null) {
    boysTF.groups.name += (tempBoysTF[1] + '; ')
    boysTF.groups.address += (tempBoysTF[2] + '; ')
  }
  boysTF.groups.address = boysTF.groups.address.replace(/;\s*$/, '')
  boysTF.groups.name = boysTF.groups.name.replace(/;\s*$/, '')

  re = /<b>Girls Track.*<\/b>: (?<name>[\w ]+) &.*mailto:(?<address>.+)"/gm
  let tempGirlsTF
  let girlsTF = {
    groups: {
      name: '',
      address: ''
    }
  }
  while ((tempGirlsTF = re.exec(String(text))) !== null) {
    girlsTF.groups.name += (tempGirlsTF[1] + '; ')
    girlsTF.groups.address += (tempGirlsTF[2] + '; ')
  }
  girlsTF.groups.address = girlsTF.groups.address.replace(/;\s*$/, '')
  girlsTF.groups.name = girlsTF.groups.name.replace(/;\s*$/, '')

  ADs = checkTeam(ADs)
  boysXC = checkTeam(boysXC)
  girlsXC = checkTeam(girlsXC)
  boysTF = checkTeam(boysTF)
  girlsTF = checkTeam(girlsTF)

  return ({
    ad: {
      name: ADs.groups.name,
      address: ADs.groups.address
    },
    boysCross: {
      name: boysXC.groups.name,
      address: boysXC.groups.address
    },
    girlsCross: {
      name: girlsXC.groups.name,
      address: girlsXC.groups.address
    },
    boysTrack: {
      name: boysTF.groups.name,
      address: boysTF.groups.address
    },
    girlsTrack: {
      name: girlsTF.groups.name,
      address: girlsTF.groups.address
    }
  })
}

function checkTeam (team) {
  try {
    if (team.groups.name) { /* empty */ }
    if (team.groups.address) { /* empty */ }
  } catch (err) {
    try {
      if (team.groups.name) { /* empty */ }
      team = {
        groups: {
          name: team.groups.name,
          address: ''
        }
      }
    } catch (err) {
      team = {
        groups: {
          name: '',
          address: ''
        }
      }
    }
  }
  return team
}

// Minnesota Schools
export async function collectSchoolsMN () {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false
  })
  const page = await browser.newPage()

  const allSchools = []

  let pageId = 0
  const options = {
    button: 'middle'
  }
  // TODO: change while loop to reach max pages
  while (pageId < 10) {
    try {
      page.goto(`https://www.mshsl.org/schools?page=${pageId}`)
      const element = await page.$$eval('.school-teaser__title')
    } catch (e) {
      console.error('Error visiting page')
      console.error(e)
    }
    pageId++
  }
  // while list with class pager__item--next is found, proceed
  // for every item with class views-row except the last one click & proceed
  // wait for page to load, THEN collect school information at the top if exists
  // find activites director at bottom if they exist and collect their information and extract their email from the link
  // if (xc boys, xc girls, tf boys, tf girls) exist, find and click them
  // (an a tag with content of the text is detected or maybe detection by class)
  // after page is clicked wait for team info to load. class="team-personel-title" if position following it is head coach (consider multiple coaches as well)

  await browser.close()
}
