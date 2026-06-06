const mysql = require('mysql2/promise');
let sql;
const buatKoneksi = async () => {
    return await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    })
}
const tambahBackup = async (id, nama, channel) => {
    const db = await buatKoneksi();
    sql = `INSERT INTO backup VALUES('${id}', '${nama}', '${channel}', NOW())`;
    try {
        await db.execute(sql);
        return "1";
    }catch(err){
        return "0";
    }
}
const tambahTransaksi = async (idx, id, waktux, nominalx, jenisx, deskripsix) => {
    const db = await buatKoneksi();
    sql = `INSERT INTO backup_transaksi VALUES('${idx}', '${id}', '${waktux}', '${nominalx}', '${jenisx}', '${deskripsix}')`;
    try {
        await db.execute(sql);
        return "1";
    }catch(err){
        return "0";
    }
}

const getMetode = async () => {
    const db = await buatKoneksi();
    sql = "SELECT * FROM backup";
    const [rows] = await db.execute(sql);
    return rows.length > 0 ? rows : false;
}

const bacaBackup = async () => {
    const db = await buatKoneksi();
    sql = `SELECT * FROM backup ORDER BY waktu DESC`;
    const [rows] = await db.execute(sql);
    return rows.length > 0 ? rows : false;
}

const bacaDetailBackup = async (id_backup) => {
    const db = await buatKoneksi();
    sql = `SELECT * FROM backup_transaksi WHERE id_backup = '${id_backup}' ORDER BY tgl_jam`;
    const [rows] = await db.execute(sql);
    return rows.length > 0 ? rows : false;
}

module.exports = {buatKoneksi, tambahBackup, tambahTransaksi, getMetode, bacaBackup, bacaDetailBackup};