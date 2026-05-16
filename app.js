const express = require("express");
const app = express();
const port = process.env.PORT || 5775;

app.get("/status", (req, res) => {
    res.send(
        '{"kode":"01", "status":"API Berbasis ExpressJS OK"}'
    );
})

app.listen(port, () => {
    console.log(`API Berjalan di Port: ${port}`);
})