import SchoolDatum from './models/Schemas.js'
// import fs from 'fs'

export const resolvers = {
  Query: {
    greetings: () => 'Hello There',
    nameTest: (parent, args) => `Hello ${args.name}`,
    schoolData: async (parent, args, context, info) => {
      const { comparison, limit, sortBy } = args
      const keys = Object.keys(comparison)
      let sortKey
      let sorter
      if (sortBy) {
        sorter = sortBy.split('_')
        if (sorter[1] === 'DESC') { sortKey = -1 } else { sortKey = 1 }
      }
      // console.log(keys)
      // const requestedFields = info.fieldNodes[0].selectionSet.selections.map((selection) => selection.name.value)
      try {
        const query = { schoolId: '' }
        for (const key of keys) {
          switch (key) {
            case 'schoolId_lte':
              query.schoolId = { ...query.schoolId, $lte: comparison[key] }
              break
            case 'schoolId_lt':
              query.schoolId = { ...query.schoolId, $lt: comparison[key] }
              break
            case 'schoolId_gt':
              query.schoolId = { ...query.schoolId, $gt: comparison[key] }
              break
            case 'schoolId_gte':
              query.schoolId = { ...query.schoolId, $gte: comparison[key] }
              break
            default :
              throw new Error(`Key: ${key} does not exist, check which keys your comparison has`)
          }
        }
        const sortObject = {}
        sortObject[sorter[0]] = sortKey
        const results = await SchoolDatum.find(query)
          .limit(limit)
          .sort(sortObject)
        // fs.writeFileSync('server/test.json', JSON.stringify(results, null, 2), { encoding: 'utf8' })
        return results
      } catch (err) {
        console.log(err)
      }
    },
    schoolDatum: async (parent, args) => {
      const results = await SchoolDatum.find(args)
      console.log(results)
      return results
    }
  },
  Mutation: {
    upsertOneSchoolDatum: async (parent, args) => {
      const { details } = args

      try {
        const result = await SchoolDatum.updateOne(
          { schoolId: details.schoolId },
          details,
          { upsert: true }
        )

        return await SchoolDatum.findOne({ schoolId: details.schoolId })
      } catch (e) {
        console.error(e)
        throw new Error('Could Not Upsert School')
      }
    },
    upsertManySchoolDatum: async (parent, args) => {
      const { details } = args

      try {
        // Build upsert operations
        const operations = details.map(item => {
          return {
            updateOne: {
              filter: { schoolId: item.schoolId },
              update: item,
              upsert: true
            }
          }
        })

        // Bulk upsert documents
        const result = await SchoolDatum.bulkWrite(operations)

        // Return inserted/upserted docs
        return SchoolDatum.find({
          schoolId: { $in: details.map(d => d.schoolId) }
        })
      } catch (error) {
        console.error(error)
        throw new Error('Error upserting schools')
      }
    },
    insertOneSchoolDatum: async (parent, args) => {
      if (args.details.schoolId) {
        if (await SchoolDatum.findOne({ schoolId: args.details.schoolId }).exec() !== null) {
          throw new Error(`SchoolId ${args.details.schoolId} already exists`)
        }
      }
      const newSchool = new SchoolDatum({ ...args.details })
      const savedSchool = await newSchool.save()
      return savedSchool
    },
    insertManySchoolDatum: async (parent, args) => {
      const details = args.details
      const schools = []
      for (const school of details) {
        if (school.schoolId) {
          const test = await SchoolDatum.findOne({ schoolId: school.schoolId }).exec()
          console.log(test)
          if (test !== null) {
            throw new Error(`SchoolId ${school.schoolId} already exists`)
          }
        }
        const newSchool = new SchoolDatum({ ...school })
        const savedSchool = await newSchool.save()
        schools.push(savedSchool)
      }

      const ids = []
      for (const school of schools) {
        ids.push(school.schoolId)
      }
      return ids
    },
    updateOneSchoolDatum: async (parent, args) => {
      if (args.details.schoolId) {
        const test = await SchoolDatum.findOne({ schoolId: args.details.schoolId }).exec()
        console.log(test)
        if (test !== null) {
          throw new Error(`SchoolId ${args.details.schoolId} already exists`)
        }
      }
      const result = await SchoolDatum.findOneAndUpdate({ schoolId: args.schoolId }, { ...args.details })
      if (!result) {
        throw new Error(`School with ${args.schoolId} not found`)
      }
      console.log(result)
      return result
    },
    updateManySchoolDatum: async (parent, args) => {
      const schools = []
      for (let i = 0; i < args.schoolIds.length; i++) {
        if (args.details[i].schoolId) {
          const test = await SchoolDatum.findOne({ schoolId: args.details[i].schoolId }).exec()
          console.log(test)
          if (test !== null) {
            throw new Error(`SchoolId ${args.details[i].schoolId} already exists`)
          }
        }
        const result = await SchoolDatum.findOneAndUpdate({ schoolId: args.schoolIds[i] }, { ...args.details[i] })
        if (!result) {
          throw new Error(`School with ${args.schoolIds[i]} not found`)
        }
        schools.push(result)
      }
      const ids = []
      for (const school of schools) {
        ids.push(school.schoolId)
      }
      return ids
    },
    deleteOneSchoolDatum: async (parent, args) => {
      const result = await SchoolDatum.findOneAndDelete({ schoolId: args.schoolId })
      if (!result) {
        throw new Error(`School with ${args.schoolId} not found`)
      }
      return result
    },
    deleteManySchoolDatum: async (parent, args) => {
      let count = 0
      for (const id of args.schoolIds) {
        const result = await SchoolDatum.findOneAndDelete({ schoolId: id })
        if (!result) {
          throw new Error(`School with ${id} not found`)
        }
        count++
      }
      return count
    }
  }
}
