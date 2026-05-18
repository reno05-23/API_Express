const express = require("express");
const cors = require("cors");
const db = require("./db");
const app = express();
const port = process.env.PORT || 5775;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/status", (req, res) => {
    res.send(
        '{"kode":"01", "status":"API Berbasis ExpressJS OK"}'
    );
})

app.listen(port, () => {
    console.log(`API Berjalan di Port: ${port}`);
})

app.post("/backup", async (req, res) => {
    let pesanx, kodex;
    let nama = req.body.nama_backup;
    let dtx = atob(req.body.dtx);
    let id = Date.now();
    let arr_data = dtx.split("#");
    let proses = await db.tambahBackup(id, nama, "nodejs");
    if(proses == "1"){
        let berhasil = 0;
        let gagal = 0;
        for(k of arr_data){
            let arr_data2 = k.split("|");
            let idx = arr_data2[0];
            let deskripsix = arr_data2[1];
            let waktux = arr_data2[2];
            let nominalx = arr_data2[3];
            let jenisx = arr_data2[4];
            let proses2 = await db.tambahTransaksi(`${id}-${idx}`, id, waktux, nominalx, jenisx, deskripsix);
            proses2 == "1" ? berhasil++ : gagal++;
        }
        pesanx = {kode: "01", status: "Proses Backup Berhasil dengan Rincian ", berhasil: berhasil, gagal: gagal};
        kodex = 200;
    }else{
        pesanx = {kode: "00", status: "Proses Backup Gagal, Periksa Kembali Data Anda"};
        kodex = 500;
    }
    return res.status(kodex).json(pesanx);
})