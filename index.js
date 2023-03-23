const express = require('express');
const cors = require("cors");
const app = express();
const port = 3000;

const hotspotLocRouter = require('./routes/hotspot_loc');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

app.get("/", (req, res) => {
    res.json({ message: "ok" });
});

app.use('/v1/hotspot_loc', hotspotLocRouter);

/* Error handler middleware */
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});