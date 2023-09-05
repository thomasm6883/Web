import Express from 'express'
import { collectSchoolsIL, collectSchoolsWI, collectSchoolsMN } from '../../client/datahelper.js'

const router = new Express.Router()
router.use(Express.json())

router.get('/ilSchools', async (req, res) => {
  try {
    await collectSchoolsIL()
    res.send('Illinois Schools Collected')
  } catch (e) {
    res.status(500).send('Error Collecting Data from Illinois Directory')
  }
})

router.get('/wiSchools', async (req, res) => {
  try {
    await collectSchoolsWI()
    res.send('Wisconsin Schools Collected')
  } catch (e) {
    res.status(500).send('Error Collecting Data from Wisconsin Directory')
  }
})

router.get('/mnSchools', async (req, res) => {
  try {
    await collectSchoolsMN()
    res.send('Minnesota Schools Collected')
  } catch (e) {
    res.status(500).send('Error Collecting Data from Minnesota Directory')
  }
})

export default router
