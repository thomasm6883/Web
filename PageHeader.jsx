import React from 'react'
import { AppBar, Toolbar, Button, Box } from '@mui/material'
import { getSchools } from '../datahelperGraphql'

export default function PageHeader (props) {
  return (
    <header>
      <AppBar>
        <Toolbar>
          Welcome To The IL WI MN Directory
          <Box
            m={1}
            display="flex"
            justifyContent="flex-end"
            alignItems="flex-end"
          >
            <Button
              variant="contained"
              onClick={() => getSchools()}
              sx={{ color: 'black', backgroundColor: 'orange', borderColor: 'green', mx: '5px' }}
            >
              Get Schools From IL Data
            </Button>
            <Button
              variant="contained"
              // onClick={() => getSchools()}
              sx={{ color: 'black', backgroundColor: 'orange', borderColor: 'green', mx: '5px' }}
            >
              Get Schools From WI Data
            </Button>
            <Button
              variant="contained"
              // onClick={() => getSchools()}
              sx={{ color: 'black', backgroundColor: 'orange', borderColor: 'green', mx: '5px' }}
            >
              Get Schools From MN Data
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    </header>
  )
}
