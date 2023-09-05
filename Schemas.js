import mongoose from 'mongoose'

const SchoolData = new mongoose.Schema({
  ad: {
    address: String,
    name: String
  },
  boysCross: {
    address: String,
    name: String
  },
  boysTrack: {
    address: String,
    name: String
  },
  girlsCross: {
    address: String,
    name: String
  },
  girlsTrack: {
    address: String,
    name: String
  },
  schoolId: String,
  mailing: String,
  name: String,
  phone: String,
  city: String,
  state: String,
  street: String,
  zip: String
})

const SchoolDatum = mongoose.model('SchoolDatum', SchoolData, 'schools')

export default SchoolDatum
