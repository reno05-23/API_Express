require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const Pusher = require("pusher");

const app = express();
const port = process.env.PORT || 5775;

// Inisialisasi Pusher (server-side)
const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true
});

app.set("view engine", "ejs");
app.set("views", "view");
app.use(express.static(__dirname + "/public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    const dtx = await db.getMetode();
    res.render("beranda", { data: dtx });
});

app.get("/status", (req, res) => {
    res.send('{"kode":"01", "status":"API Berbasis ExpressJS OK"}');
});

app.post("/backup", async (req, res) => {
    let pesanx, kodex;
    let nama = req.body.nama_backup;
    let dtx = atob(req.body.dtx);
    let id = Date.now();
    let arr_data = dtx.split("#");
    let proses = await db.tambahBackup(id, nama, "nodejs");

    if (proses == "1") {
        let berhasil = 0;
        let gagal = 0;
        for (k of arr_data) {
            let arr_data2 = k.split("|");
            let idx = arr_data2[0];
            let deskripsix = arr_data2[1];
            let waktux = arr_data2[2];
            let nominalx = arr_data2[3];
            let jenisx = arr_data2[4];
            let proses2 = await db.tambahTransaksi(`${id}-${idx}`, id, waktux, nominalx, jenisx, deskripsix);
            proses2 == "1" ? berhasil++ : gagal++;
        }

        // ✅ Trigger event Pusher setelah backup berhasil
        await pusher.trigger("backup-channel", "backup-baru", {
            id: id,
            nama: nama,
            channel: "nodejs",
            waktu: new Date().toISOString(),
            jumlah_data: arr_data.length,
            berhasil: berhasil,
            gagal: gagal
        });

        pesanx = { kode: "01", status: "Proses Backup Berhasil dengan Rincian ", berhasil: berhasil, gagal: gagal };
        kodex = 200;
    } else {
        pesanx = { kode: "00", status: "Proses Backup Gagal, Periksa Kembali Data Anda" };
        kodex = 500;
    }

    return res.status(kodex).json(pesanx);
});

app.get("/daftar_backup", async (req, res) => {
    const dtbackup = await db.bacaBackup();
    if (dtbackup == false) {
        res.send('{"kode":"00", "pesan":"Data Backup Tidak Di Temukan"}');
    } else {
        res.send('{"kode":"01", "pesan":"Data Backup Di Temukan", "data":' + JSON.stringify(dtbackup) + "}");
    }
});

app.post("/detail_backup", async (req, res) => {
    console.log("HEADERS:", req.headers["content-type"]);
    console.log("BODY:", req.body);
    console.log("QUERY:", req.query);
    let idbackup = req.body.idbackup;
    const dtdetail = await db.bacaDetailBackup(idbackup);
    if (dtdetail == false) {
        res.send('{"kode":"00", "pesan":"Data Detail Backup Tidak Di Temukan"}');
    } else {
        res.send('{"kode":"01", "pesan":"Data Detail Backup Di Temukan", "data":' + JSON.stringify(dtdetail) + "}");
    }
});

app.listen(port, () => {
    console.log(`API Berjalan di Port: ${port}`);
});