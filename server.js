const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')
const router = require('./router/route')

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors())
const PORT = process.env.PORT || 3000;
app.use('/api/v1', router);

app.get('/', async (req, resp) => {
    resp.status(201).send('This is the root page');

});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
