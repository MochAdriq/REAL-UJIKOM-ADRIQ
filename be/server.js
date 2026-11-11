const express = require('express')
const cors = require('cors')
const db = require('./db')

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

function validasi(body) {
    const data = {
        kodeSiswa: String(body.kodeSiswa).trim(),
        namaSiswa: String(body.namaSiswa).trim(),
        alamatSiswa: String(body.alamatSiswa).trim(),
        ttl: String(body.ttl).trim(),
        jurusan: String(body.jurusan).trim(),
    }

    if (!data.kodeSiswa) return { error: 'kode wajib diisi.' };
    if (!data.namaSiswa) return { error: 'nama Siswa wajib diisi.' };
    if (!data.alamatSiswa) return { error: 'alamat wajib diisi.' };
    if (!data.ttl) return { error: 'tanggal lahir data wajib diisi.' };
    if (!data.jurusan) return { 'Jurusan wajib diisi.' };
}