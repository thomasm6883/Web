import { gql } from 'graphql-tag'

export const typeDefs = gql`
  scalar ObjectId

  type Mutation {
    deleteOneSchoolDatum(schoolId:String): SchoolDatum
    deleteManySchoolDatum(schoolIds: [String]): DeleteManyPayload
    insertOneSchoolDatum(details: SchoolDatumInput): SchoolDatum
    insertManySchoolDatum(details: [SchoolDatumInput]): InsertManyPayload
    updateOneSchoolDatum(schoolId:String, details: SchoolDatumInput): SchoolDatum
    updateManySchoolDatum(schoolIds:[String], details: [SchoolDatumInput]): UpdateManyPayload
    upsertOneSchoolDatum(details: SchoolDatumInput): SchoolDatum
    upsertManySchoolDatum(details: [SchoolDatumInput]): [SchoolDatum]
  }
  type InsertManyPayload {
    insertedIds: [Int]
  }
  type DeleteManyPayload {
    deletedCount: Int
  }
  type UpdateManyPayload {
    updatedIds: [Int]
  }

  type Query {
    greetings: String
    nameTest(name: String!): String
    schoolData(comparison: SchoolDatumQueryInput, limit: Int, sortBy: SchoolDatumSortByInput): [SchoolDatum]!
    schoolDatum(schoolId:String): SchoolDatum
  }

  input SchoolDatumQueryInput {
    city_in: [String]
    mailing_lte: String
    schoolId_nin: [String]
    phone_lte: String
    phone_gt: String
    mailing: String
    ad_exists: Boolean
    name_ne: String
    street_lt: String
    street: String
    street_gte: String
    mailing_in: [String]
    state_in: [String]
    mailing_lt: String
    schoolId_lte:String
    name: String
    zip_ne: String
    _id_exists: Boolean
    zip_exists: Boolean
    girlsTrack: SchoolDatumGirlsTrackQueryInput
    schoolId_lt:String
    state_gte: String
    phone_exists: Boolean
    city_gt: String
    street_ne: String
    name_gte: String
    boysCross_exists: Boolean
    street_in: [String]
    phone_lt: String
    schoolId_ne:String
    state_lte: String
    AND: [SchoolDatumQueryInput!]
    city_exists: Boolean
    schoolId:String
    phone_in: [String]
    state: String
    name_exists: Boolean
    mailing_ne: String
    zip_gt: String
    city_lte: String
    name_in: [String]
    schoolId_gte:String
    state_ne: String
    mailing_nin: [String]
    zip_lt: String
    street_exists: Boolean
    city_nin: [String]
    name_lte: String
    zip_lte: String
    state_gt: String
    city_lt: String
    zip_nin: [String]
    schoolId_exists: Boolean
    schoolId_in: [String]
    name_lt: String
    phone_nin: [String]
    state_nin: [String]
    boysTrack: SchoolDatumBoysTrackQueryInput
    phone: String
    phone_gte: String
    boysTrack_exists: Boolean
    street_gt: String
    street_nin: [String]
    phone_ne: String
    schoolId_gt:String
    street_lte: String
    state_lt: String
    OR: [SchoolDatumQueryInput!]
    name_nin: [String]
    girlsTrack_exists: Boolean
    name_gt: String
    city_gte: String
    girlsCross_exists: Boolean
    mailing_gte: String
    city: String
    mailing_exists: Boolean
    boysCross: SchoolDatumBoysCrossQueryInput
    zip_in: [String]
    girlsCross: SchoolDatumGirlsCrossQueryInput
    ad: SchoolDatumAdQueryInput
    mailing_gt: String
    zip: String
    zip_gte: String
    state_exists: Boolean
    city_ne: String
  }
  input SchoolDatumAdQueryInput {
    name_gte: String
    name_exists: Boolean
    address_gte: String
    address_in: [String]
    name_nin: [String]
    AND: [SchoolDatumAdQueryInput!]
    OR: [SchoolDatumAdQueryInput!]
    name_lte: String
    address_nin: [String]
    address_gt: String
    name_ne: String
    address_exists: Boolean
    name: String
    address_lte: String
    name_gt: String
    address: String
    address_ne: String
    address_lt: String
    name_in: [String]
    name_lt: String
  }
  input SchoolDatumBoysCrossQueryInput {
    name_ne: String
    address_lt: String
    address_exists: Boolean
    address_ne: String
    address_gt: String
    AND: [SchoolDatumBoysCrossQueryInput!]
    address: String
    address_lte: String
    OR: [SchoolDatumBoysCrossQueryInput!]
    name_in: [String]
    name_gte: String
    name_lte: String
    address_in: [String]
    name_exists: Boolean
    address_gte: String
    address_nin: [String]
    name: String
    name_gt: String
    name_lt: String
    name_nin: [String]
  }
  input SchoolDatumBoysTrackQueryInput {
    address_exists: Boolean
    name_lte: String
    address: String
    address_nin: [String]
    name_in: [String]
    address_lt: String
    name_nin: [String]
    name_gte: String
    name_exists: Boolean
    name_gt: String
    name_lt: String
    address_lte: String
    name: String
    AND: [SchoolDatumBoysTrackQueryInput!]
    address_gt: String
    address_gte: String
    name_ne: String
    OR: [SchoolDatumBoysTrackQueryInput!]
    address_in: [String]
    address_ne: String
  }
  input SchoolDatumGirlsCrossQueryInput {
    address_exists: Boolean
    name_nin: [String]
    name_ne: String
    name: String
    address_lte: String
    address_in: [String]
    address_nin: [String]
    address_lt: String
    name_gte: String
    address_gte: String
    address_ne: String
    name_gt: String
    name_exists: Boolean
    name_lte: String
    OR: [SchoolDatumGirlsCrossQueryInput!]
    name_in: [String]
    address: String
    address_gt: String
    name_lt: String
    AND: [SchoolDatumGirlsCrossQueryInput!]
  }
  input SchoolDatumGirlsTrackQueryInput {
    name: String
    name_ne: String
    name_gte: String
    address_in: [String]
    AND: [SchoolDatumGirlsTrackQueryInput!]
    OR: [SchoolDatumGirlsTrackQueryInput!]
    name_gt: String
    address_ne: String
    address_lt: String
    name_nin: [String]
    name_in: [String]
    address_exists: Boolean
    address_gte: String
    name_lt: String
    name_exists: Boolean
    address_gt: String
    address: String
    address_lte: String
    address_nin: [String]
    name_lte: String
  }

  type SchoolDatumAd {
    address: String
    name: String
  }
  type SchoolDatumBoysTrack {
    address: String
    name: String
  }
  type SchoolDatumGirlsTrack {
    address: String
    name: String
  }
  type SchoolDatumBoysCross {
    address: String
    name: String
  }
  type SchoolDatumGirlsCross {
    address: String
    name: String
  }

  input SchoolDatumAdInput {
    address: String
    name: String
  }
  input SchoolDatumBoysTrackInput {
    address: String
    name: String
  }
  input SchoolDatumGirlsTrackInput {
    address: String
    name: String
  }
  input SchoolDatumBoysCrossInput {
    address: String
    name: String
  }
  input SchoolDatumGirlsCrossInput {
    address: String
    name: String
  }

  type SchoolDatum {
    ad: SchoolDatumAd
    boysCross: SchoolDatumBoysCross
    boysTrack: SchoolDatumBoysTrack
    city: String
    girlsCross: SchoolDatumGirlsCross
    girlsTrack: SchoolDatumGirlsTrack
    schoolId:String
    mailing: String
    name: String
    phone: String
    state: String
    street: String
    zip: String
  }
  enum SchoolDatumSortByInput {
    schoolId_ASC
    schoolId_DESC
  }

  input SchoolDatumInput {
    ad: SchoolDatumAdInput
    boysCross: SchoolDatumBoysCrossInput
    boysTrack: SchoolDatumBoysTrackInput
    city: String
    girlsCross: SchoolDatumGirlsCrossInput
    girlsTrack: SchoolDatumGirlsTrackInput
    schoolId:String
    mailing: String
    name: String
    phone: String
    state: String
    street: String
    zip: String
  }
`
