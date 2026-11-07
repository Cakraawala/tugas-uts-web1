// Mengubah angka menjadi format rupiah, contoh: 180000 -> "Rp 180.000"
function formatRupiah(angka) {
    return "Rp " + angka.toLocaleString("id-ID");
}

// Mengubah teks harga menjadi angka, contoh: "Rp 180.000" -> 180000
function ambilAngka(teksHarga) {
    return parseInt(String(teksHarga).replace(/[^0-9]/g, "")) || 0;
}

// Mengambil daftar transaksi dari localStorage
function ambilTransaksi() {
    var dataTersimpan = localStorage.getItem("transaksi");
    if (dataTersimpan === null) {
        return [];
    }
    return JSON.parse(dataTersimpan);
}

// Menyimpan daftar transaksi ke localStorage
function simpanTransaksi(daftarTransaksi) {
    localStorage.setItem("transaksi", JSON.stringify(daftarTransaksi));
}

// Cek apakah user sudah login, kalau belum kembali ke halaman login
function cekLogin() {
    var namaUser = localStorage.getItem("namaUser");
    if (namaUser === null) {
        alert("Silakan login terlebih dahulu.");
        window.location.href = "index.html";
        return false;
    }
    return true;
}

// Tombol logout (di navbar dan di menu dashboard)
function aturLogout() {
    var semuaTombolLogout = document.querySelectorAll(".link-logout");
    semuaTombolLogout.forEach(function (tombol) {
        tombol.addEventListener("click", function (event) {
            event.preventDefault();
            if (confirm("Yakin ingin logout?")) {
                // hanya data login yang dihapus, data transaksi tetap disimpan
                localStorage.removeItem("namaUser");
                localStorage.removeItem("emailUser");
                window.location.href = "index.html";
            }
        });
    });
}

// Menambahkan buku baru (hasil form tambah stok) yang tersimpan di localStorage
// ke dalam dataKatalogBuku, supaya tetap ada setelah halaman di-refresh
function muatStokTambahan() {
    var dataTersimpan = localStorage.getItem("stokTambahan");
    if (dataTersimpan === null) {
        return;
    }
    var stokTambahan = JSON.parse(dataTersimpan);
    for (var i = 0; i < stokTambahan.length; i++) {
        dataKatalogBuku.push(stokTambahan[i]);
    }
}

// Mengurangi stok buku sesuai jumlah yang sudah dipesan di halaman Checkout.
// Stok dihitung ulang dari transaksi, jadi kalau transaksi dihapus stok kembali.
function kurangiStokTerjual() {
    var transaksi = ambilTransaksi();
    for (var i = 0; i < transaksi.length; i++) {
        var items = transaksi[i].items;
        for (var j = 0; j < items.length; j++) {
            var buku = cariBuku(items[j].kodeBarang);
            if (buku !== null) {
                buku.stok = buku.stok - items[j].jumlah;
            }
        }
    }
}

// Menggabungkan data tracking bawaan (data.js) dan transaksi dari localStorage
// menjadi satu array, dipakai di halaman tracking, laporan, dan history
function ambilSemuaPesanan() {
    var semuaPesanan = [];
    for (var nomor in dataTracking) {
        semuaPesanan.push(dataTracking[nomor]);
    }
    var transaksi = ambilTransaksi();
    for (var i = 0; i < transaksi.length; i++) {
        semuaPesanan.push(transaksi[i]);
    }
    return semuaPesanan;
}

// Persentase progress dan warna untuk tiap status pengiriman
function infoStatus(status) {
    if (status === "Diproses") {
        return { persen: 25, warna: "#d98c00", tahap: 0 };
    } else if (status === "Dikirim") {
        return { persen: 50, warna: "#2b78c2", tahap: 1 };
    } else if (status === "Dalam Perjalanan") {
        return { persen: 75, warna: "#6a4fb3", tahap: 2 };
    } else if (status === "Selesai") {
        return { persen: 100, warna: "#2e7d32", tahap: 3 };
    }
    return { persen: 0, warna: "#888888", tahap: -1 };
}

// Membuat label status berwarna (dipakai di tabel laporan dan history)
function buatLabelStatus(status) {
    var label = document.createElement("span");
    label.className = "label-status";
    label.textContent = status;
    label.style.backgroundColor = infoStatus(status).warna;
    return label;
}

// Membuka dan menutup modal box
function bukaModal(idModal) {
    document.getElementById(idModal).classList.add("tampil");
}

function tutupModal(idModal) {
    document.getElementById(idModal).classList.remove("tampil");
}


// ===== Halaman Login =====
function halamanLogin() {
    // kalau sudah login, langsung ke dashboard
    if (localStorage.getItem("namaUser") !== null) {
        window.location.href = "dashboard.html";
        return;
    }

    var formLogin = document.getElementById("formLogin");

    formLogin.addEventListener("submit", function (event) {
        event.preventDefault();

        var email = document.getElementById("loginEmail").value.trim();
        var password = document.getElementById("loginPassword").value;

        // validasi field kosong
        if (email === "" || password === "") {
            alert("Email dan password wajib diisi!");
            return;
        }

        // cari pengguna yang email dan password-nya cocok
        var penggunaDitemukan = null;
        for (var i = 0; i < dataPengguna.length; i++) {
            if (dataPengguna[i].email === email && dataPengguna[i].password === password) {
                penggunaDitemukan = dataPengguna[i];
            }
        }

        if (penggunaDitemukan === null) {
            alert("email/password yang anda masukkan salah");
            return;
        }

        // login berhasil, simpan data user lalu pindah ke dashboard
        localStorage.setItem("namaUser", penggunaDitemukan.nama);
        localStorage.setItem("emailUser", penggunaDitemukan.email);
        alert("Login berhasil. Selamat datang, " + penggunaDitemukan.nama + "!");
        window.location.href = "dashboard.html";
    });

    // tombol untuk membuka modal
    document.getElementById("tombolLupa").addEventListener("click", function () {
        bukaModal("modalLupa");
    });
    document.getElementById("tombolDaftar").addEventListener("click", function () {
        bukaModal("modalDaftar");
    });

    // tombol untuk menutup modal
    document.getElementById("tutupLupa").addEventListener("click", function () {
        tutupModal("modalLupa");
    });
    document.getElementById("tutupDaftar").addEventListener("click", function () {
        tutupModal("modalDaftar");
    });

    // klik area gelap di luar kotak juga menutup modal
    var semuaModal = document.querySelectorAll(".modal");
    semuaModal.forEach(function (modal) {
        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                modal.classList.remove("tampil");
            }
        });
    });

    // form lupa password
    document.getElementById("formLupa").addEventListener("submit", function (event) {
        event.preventDefault();
        var email = document.getElementById("lupaEmail").value.trim();
        if (email === "") {
            alert("Email wajib diisi!");
            return;
        }
        alert("Link reset password sudah dikirim ke " + email);
        this.reset();
        tutupModal("modalLupa");
    });

    // form daftar
    document.getElementById("formDaftar").addEventListener("submit", function (event) {
        event.preventDefault();
        var nama = document.getElementById("daftarNama").value.trim();
        var email = document.getElementById("daftarEmail").value.trim();
        var password = document.getElementById("daftarPassword").value;

        if (nama === "" || email === "" || password === "") {
            alert("Semua field pendaftaran wajib diisi!");
            return;
        }
        if (email.indexOf("@") === -1) {
            alert("Format email tidak valid!");
            return;
        }
        if (password.length < 6) {
            alert("Password minimal 6 karakter!");
            return;
        }
        alert("Pendaftaran berhasil! Silakan login.");
        this.reset();
        tutupModal("modalDaftar");
    });
}


// ===== Halaman Dashboard =====
function halamanDashboard() {
    var namaUser = localStorage.getItem("namaUser");
    var jam = new Date().getHours();
    var salam = "";

    // tentukan salam berdasarkan jam lokal
    if (jam >= 4 && jam < 11) {
        salam = "Selamat Pagi";
    } else if (jam >= 11 && jam < 15) {
        salam = "Selamat Siang";
    } else if (jam >= 15 && jam < 18) {
        salam = "Selamat Sore";
    } else {
        salam = "Selamat Malam";
    }

    document.getElementById("teksGreeting").textContent = salam + ", " + namaUser;

    // tampilkan tanggal hari ini
    var pilihanFormat = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
    document.getElementById("teksTanggal").textContent = new Date().toLocaleDateString("id-ID", pilihanFormat);
}


// ===== Halaman Stok/Katalog =====

// Membuat ulang isi tabel stok dari array dataKatalogBuku
function tampilkanTabelStok() {
    var isiTabel = document.getElementById("isiTabelStok");
    isiTabel.innerHTML = "";

    for (var i = 0; i < dataKatalogBuku.length; i++) {
        var buku = dataKatalogBuku[i];
        var baris = document.createElement("tr");

        // kolom nomor
        var kolomNo = document.createElement("td");
        kolomNo.textContent = i + 1;
        baris.appendChild(kolomNo);

        // kolom gambar sampul
        var kolomGambar = document.createElement("td");
        if (buku.cover) {
            var gambar = document.createElement("img");
            gambar.src = buku.cover;
            gambar.alt = "Sampul buku " + buku.namaBarang;
            gambar.className = "gambar-buku";
            kolomGambar.appendChild(gambar);
        } else {
            kolomGambar.textContent = "-";
        }
        baris.appendChild(kolomGambar);

        // kolom teks lainnya
        var isiKolom = [buku.kodeBarang, buku.namaBarang, buku.jenisBarang, buku.edisi];
        for (var j = 0; j < isiKolom.length; j++) {
            var kolom = document.createElement("td");
            kolom.textContent = isiKolom[j];
            baris.appendChild(kolom);
        }

        var kolomStok = document.createElement("td");
        kolomStok.className = "kanan";
        kolomStok.textContent = buku.stok;
        baris.appendChild(kolomStok);

        var kolomHarga = document.createElement("td");
        kolomHarga.className = "kanan";
        kolomHarga.textContent = buku.harga;
        baris.appendChild(kolomHarga);

        isiTabel.appendChild(baris);
    }

    document.getElementById("jumlahJudul").textContent = dataKatalogBuku.length;
}

function halamanStok() {
    muatStokTambahan();
    kurangiStokTerjual();
    tampilkanTabelStok();

    var formStok = document.getElementById("formStok");
    var pesanError = document.getElementById("errorStok");

    formStok.addEventListener("submit", function (event) {
        event.preventDefault();

        var kode = document.getElementById("stokKode").value.trim().toUpperCase();
        var nama = document.getElementById("stokNama").value.trim();
        var jenis = document.getElementById("stokJenis").value;
        var edisi = document.getElementById("stokEdisi").value;
        var jumlah = document.getElementById("stokJumlah").value;
        var harga = document.getElementById("stokHarga").value;

        // validasi: semua field wajib diisi
        if (kode === "" || nama === "" || jenis === "" || edisi === "" || jumlah === "" || harga === "") {
            pesanError.textContent = "Semua field wajib diisi.";
            alert("Semua field wajib diisi!");
            return;
        }

        // validasi: angka harus lebih dari 0
        if (Number(edisi) < 1 || Number(jumlah) < 1 || Number(harga) < 1) {
            pesanError.textContent = "Edisi, jumlah stok, dan harga harus berupa angka lebih dari 0.";
            alert("Edisi, jumlah stok, dan harga harus angka lebih dari 0!");
            return;
        }

        // validasi: kode barang tidak boleh sama
        for (var i = 0; i < dataKatalogBuku.length; i++) {
            if (dataKatalogBuku[i].kodeBarang === kode) {
                pesanError.textContent = "Kode barang " + kode + " sudah ada.";
                alert("Kode barang sudah terdaftar!");
                return;
            }
        }

        var bukuBaru = {
            kodeBarang: kode,
            namaBarang: nama,
            jenisBarang: jenis,
            edisi: edisi,
            stok: parseInt(jumlah),
            harga: formatRupiah(parseInt(harga)),
            cover: ""
        };

        // tambahkan ke array lalu tampilkan ulang tabel
        dataKatalogBuku.push(bukuBaru);
        tampilkanTabelStok();

        // simpan juga ke localStorage supaya bisa dipesan di halaman checkout
        var stokTambahan = JSON.parse(localStorage.getItem("stokTambahan") || "[]");
        stokTambahan.push(bukuBaru);
        localStorage.setItem("stokTambahan", JSON.stringify(stokTambahan));

        pesanError.textContent = "";
        formStok.reset();
        alert("Buku \"" + nama + "\" berhasil ditambahkan ke tabel stok.");
    });

    formStok.addEventListener("reset", function () {
        pesanError.textContent = "";
    });
}


// ===== Halaman Checkout =====

// array untuk menampung buku yang dipesan
var daftarPesanan = [];

// Menampilkan isi daftarPesanan ke tabel dan menghitung total
function tampilkanTabelPesanan() {
    var isiTabel = document.getElementById("isiTabelPesanan");
    isiTabel.innerHTML = "";

    if (daftarPesanan.length === 0) {
        var barisKosong = document.createElement("tr");
        var kolomKosong = document.createElement("td");
        kolomKosong.colSpan = 6;
        kolomKosong.textContent = "Belum ada buku yang dipesan.";
        barisKosong.appendChild(kolomKosong);
        isiTabel.appendChild(barisKosong);
    }

    var total = 0;

    daftarPesanan.forEach(function (item, index) {
        var subtotal = item.harga * item.jumlah;
        total = total + subtotal;

        var baris = document.createElement("tr");

        var kolomNo = document.createElement("td");
        kolomNo.textContent = index + 1;
        baris.appendChild(kolomNo);

        var kolomJudul = document.createElement("td");
        kolomJudul.textContent = item.namaBarang;
        baris.appendChild(kolomJudul);

        var kolomHarga = document.createElement("td");
        kolomHarga.className = "kanan";
        kolomHarga.textContent = formatRupiah(item.harga);
        baris.appendChild(kolomHarga);

        // jumlah bisa diubah langsung di tabel
        var kolomJumlah = document.createElement("td");
        var inputJumlah = document.createElement("input");
        inputJumlah.type = "number";
        inputJumlah.min = "1";
        inputJumlah.value = item.jumlah;
        inputJumlah.className = "input-jumlah";
        inputJumlah.setAttribute("aria-label", "Jumlah " + item.namaBarang);
        inputJumlah.addEventListener("change", function () {
            ubahJumlahPesanan(index, this.value);
        });
        kolomJumlah.appendChild(inputJumlah);
        baris.appendChild(kolomJumlah);

        var kolomSubtotal = document.createElement("td");
        kolomSubtotal.className = "kanan";
        kolomSubtotal.textContent = formatRupiah(subtotal);
        baris.appendChild(kolomSubtotal);

        var kolomAksi = document.createElement("td");
        var tombolHapus = document.createElement("button");
        tombolHapus.type = "button";
        tombolHapus.textContent = "Hapus";
        tombolHapus.className = "tombol-merah tombol-kecil";
        tombolHapus.addEventListener("click", function () {
            hapusPesanan(index);
        });
        kolomAksi.appendChild(tombolHapus);
        baris.appendChild(kolomAksi);

        isiTabel.appendChild(baris);
    });

    document.getElementById("totalHarga").textContent = formatRupiah(total);
    return total;
}

// Mencari data buku di katalog berdasarkan kode
function cariBuku(kode) {
    for (var i = 0; i < dataKatalogBuku.length; i++) {
        if (dataKatalogBuku[i].kodeBarang === kode) {
            return dataKatalogBuku[i];
        }
    }
    return null;
}

function ubahJumlahPesanan(index, jumlahBaru) {
    jumlahBaru = parseInt(jumlahBaru);
    var item = daftarPesanan[index];
    var buku = cariBuku(item.kodeBarang);

    if (isNaN(jumlahBaru) || jumlahBaru < 1) {
        alert("Jumlah minimal 1. Gunakan tombol Hapus untuk menghapus buku.");
    } else if (jumlahBaru > buku.stok) {
        alert("Jumlah melebihi stok. Stok tersedia: " + buku.stok);
    } else {
        item.jumlah = jumlahBaru;
    }
    tampilkanTabelPesanan();
}

function hapusPesanan(index) {
    if (confirm("Hapus \"" + daftarPesanan[index].namaBarang + "\" dari pesanan?")) {
        daftarPesanan.splice(index, 1);
        tampilkanTabelPesanan();
    }
}

// Membuat nomor DO otomatis: tahun + nomor urut 4 digit, contoh 20260001
function buatNomorDO() {
    var tahun = new Date().getFullYear();
    var nomorUrut = ambilTransaksi().length + 1;
    var nomorDO = String(tahun) + String(nomorUrut).padStart(4, "0");

    // jaga-jaga kalau nomor sudah dipakai di data tracking
    while (dataTracking[nomorDO] !== undefined) {
        nomorUrut = nomorUrut + 1;
        nomorDO = String(tahun) + String(nomorUrut).padStart(4, "0");
    }
    return nomorDO;
}

// Tanggal dan waktu sekarang dalam format yyyy-mm-dd dan yyyy-mm-dd hh:mm:ss
function tanggalHariIni() {
    var sekarang = new Date();
    var bulan = String(sekarang.getMonth() + 1).padStart(2, "0");
    var tanggal = String(sekarang.getDate()).padStart(2, "0");
    return sekarang.getFullYear() + "-" + bulan + "-" + tanggal;
}

function waktuSekarang() {
    var sekarang = new Date();
    var jam = String(sekarang.getHours()).padStart(2, "0");
    var menit = String(sekarang.getMinutes()).padStart(2, "0");
    var detik = String(sekarang.getSeconds()).padStart(2, "0");
    return tanggalHariIni() + " " + jam + ":" + menit + ":" + detik;
}

function halamanCheckout() {
    muatStokTambahan();
    kurangiStokTerjual();

    // isi dropdown buku dari dataKatalogBuku
    var pilihBuku = document.getElementById("pilihBuku");
    for (var i = 0; i < dataKatalogBuku.length; i++) {
        var opsi = document.createElement("option");
        opsi.value = dataKatalogBuku[i].kodeBarang;
        opsi.textContent = dataKatalogBuku[i].namaBarang + " - " + dataKatalogBuku[i].harga;
        pilihBuku.appendChild(opsi);
    }

    // isi otomatis nama dan email dari user yang login
    document.getElementById("pemesanNama").value = localStorage.getItem("namaUser");
    document.getElementById("pemesanEmail").value = localStorage.getItem("emailUser") || "";

    tampilkanTabelPesanan();

    // tambah buku ke daftar pesanan
    document.getElementById("formPilihBuku").addEventListener("submit", function (event) {
        event.preventDefault();
        var kode = pilihBuku.value;
        var jumlah = parseInt(document.getElementById("jumlahBuku").value);

        if (kode === "") {
            alert("Silakan pilih buku terlebih dahulu!");
            return;
        }
        if (isNaN(jumlah) || jumlah < 1) {
            alert("Jumlah buku minimal 1!");
            return;
        }

        var buku = cariBuku(kode);

        // kalau buku sudah ada di pesanan, jumlahnya ditambah
        var sudahAda = false;
        for (var i = 0; i < daftarPesanan.length; i++) {
            if (daftarPesanan[i].kodeBarang === kode) {
                if (daftarPesanan[i].jumlah + jumlah > buku.stok) {
                    alert("Jumlah melebihi stok. Stok tersedia: " + buku.stok);
                    return;
                }
                daftarPesanan[i].jumlah = daftarPesanan[i].jumlah + jumlah;
                sudahAda = true;
            }
        }

        if (!sudahAda) {
            if (jumlah > buku.stok) {
                alert("Jumlah melebihi stok. Stok tersedia: " + buku.stok);
                return;
            }
            daftarPesanan.push({
                kodeBarang: buku.kodeBarang,
                namaBarang: buku.namaBarang,
                harga: ambilAngka(buku.harga),
                jumlah: jumlah
            });
        }

        tampilkanTabelPesanan();
        this.reset();
    });

    // simpan pesanan
    document.getElementById("formPemesan").addEventListener("submit", function (event) {
        event.preventDefault();
        var pesanError = document.getElementById("errorCheckout");

        var nama = document.getElementById("pemesanNama").value.trim();
        var email = document.getElementById("pemesanEmail").value.trim();
        var noHp = document.getElementById("pemesanHp").value.trim();
        var ekspedisi = document.getElementById("pemesanEkspedisi").value;
        var alamat = document.getElementById("pemesanAlamat").value.trim();
        var paket = document.getElementById("pemesanPaket").value;
        var radioBayar = document.querySelector("input[name='pembayaran']:checked");

        // kumpulkan semua kesalahan dulu, lalu tampilkan sekaligus
        var daftarError = [];

        if (daftarPesanan.length === 0) {
            daftarError.push("Daftar pesanan masih kosong.");
        }
        if (nama === "") {
            daftarError.push("Nama wajib diisi.");
        }
        if (email === "") {
            daftarError.push("Email wajib diisi.");
        } else if (email.indexOf("@") === -1 || email.indexOf(".") === -1) {
            daftarError.push("Format email tidak valid.");
        }
        if (noHp === "") {
            daftarError.push("No. HP wajib diisi.");
        } else if (!/^[0-9]{10,13}$/.test(noHp)) {
            daftarError.push("No. HP harus angka 10-13 digit.");
        }
        if (ekspedisi === "") {
            daftarError.push("Ekspedisi wajib dipilih.");
        }
        if (alamat === "") {
            daftarError.push("Alamat wajib diisi.");
        }
        if (radioBayar === null) {
            daftarError.push("Metode pembayaran wajib dipilih.");
        }

        if (daftarError.length > 0) {
            pesanError.innerHTML = daftarError.join("<br>");
            alert("Pesanan belum bisa dibuat:\n- " + daftarError.join("\n- "));
            return;
        }
        pesanError.innerHTML = "";

        var total = tampilkanTabelPesanan();
        var nomorDO = buatNomorDO();

        // data transaksi dibuat mirip dengan format dataTracking
        var transaksiBaru = {
            nomorDO: nomorDO,
            nama: nama,
            email: email,
            noHp: noHp,
            alamat: alamat,
            status: "Diproses",
            ekspedisi: ekspedisi,
            tanggalKirim: tanggalHariIni(),
            paket: paket,
            pembayaran: radioBayar.value,
            total: formatRupiah(total),
            items: daftarPesanan,
            perjalanan: [
                {
                    waktu: waktuSekarang(),
                    keterangan: "Pesanan diterima dan sedang dikemas oleh Toko Buku Cakra"
                }
            ]
        };

        var semuaTransaksi = ambilTransaksi();
        semuaTransaksi.push(transaksiBaru);
        simpanTransaksi(semuaTransaksi);

        // kurangi stok di halaman ini juga, supaya pesanan berikutnya memakai stok terbaru
        for (var k = 0; k < daftarPesanan.length; k++) {
            var bukuDipesan = cariBuku(daftarPesanan[k].kodeBarang);
            bukuDipesan.stok = bukuDipesan.stok - daftarPesanan[k].jumlah;
        }

        // tampilkan nomor DO di modal
        document.getElementById("nomorDOBaru").textContent = nomorDO;
        document.getElementById("linkLacak").href = "tracking.html?do=" + nomorDO;
        bukaModal("modalBerhasil");

        // kosongkan pesanan dan form
        daftarPesanan = [];
        tampilkanTabelPesanan();
        this.reset();
        document.getElementById("pemesanNama").value = localStorage.getItem("namaUser");
        document.getElementById("pemesanEmail").value = localStorage.getItem("emailUser") || "";
    });

    document.getElementById("tutupBerhasil").addEventListener("click", function () {
        tutupModal("modalBerhasil");
    });
}


// ===== Halaman Tracking =====

// Mencari pesanan berdasarkan nomor DO
function cariPesanan(nomorDO) {
    var semuaPesanan = ambilSemuaPesanan();
    for (var i = 0; i < semuaPesanan.length; i++) {
        if (semuaPesanan[i].nomorDO === nomorDO) {
            return semuaPesanan[i];
        }
    }
    return null;
}

function tampilkanHasilTracking(pesanan) {
    var status = infoStatus(pesanan.status);

    // label status dan progress bar
    var labelStatus = document.getElementById("labelStatus");
    labelStatus.textContent = pesanan.status;
    labelStatus.style.backgroundColor = status.warna;

    var progressIsi = document.getElementById("progressIsi");
    progressIsi.style.width = status.persen + "%";
    progressIsi.style.backgroundColor = status.warna;
    progressIsi.textContent = status.persen + "%";

    // tebalkan tahap yang sudah dilewati
    var semuaTahap = document.querySelectorAll("#tahapStatus span");
    for (var i = 0; i < semuaTahap.length; i++) {
        if (i <= status.tahap) {
            semuaTahap[i].className = "tahap-aktif";
        } else {
            semuaTahap[i].className = "";
        }
    }

    // detail pengiriman
    document.getElementById("detailDO").textContent = pesanan.nomorDO;
    document.getElementById("detailNama").textContent = pesanan.nama;
    document.getElementById("detailEkspedisi").textContent = pesanan.ekspedisi;
    document.getElementById("detailTanggal").textContent = pesanan.tanggalKirim;
    document.getElementById("detailPaket").textContent = pesanan.paket;
    document.getElementById("detailTotal").textContent = pesanan.total;

    // riwayat perjalanan
    var isiPerjalanan = document.getElementById("isiPerjalanan");
    isiPerjalanan.innerHTML = "";
    var perjalanan = pesanan.perjalanan || [];
    perjalanan.forEach(function (langkah) {
        var baris = document.createElement("tr");
        var kolomWaktu = document.createElement("td");
        kolomWaktu.textContent = langkah.waktu;
        var kolomKeterangan = document.createElement("td");
        kolomKeterangan.textContent = langkah.keterangan;
        baris.appendChild(kolomWaktu);
        baris.appendChild(kolomKeterangan);
        isiPerjalanan.appendChild(baris);
    });

    document.getElementById("hasilTracking").hidden = false;
}

function prosesCariTracking() {
    var nomorDO = document.getElementById("inputDO").value.trim();
    var pesanError = document.getElementById("errorTracking");
    var hasil = document.getElementById("hasilTracking");

    if (nomorDO === "") {
        hasil.hidden = true;
        pesanError.textContent = "Nomor DO wajib diisi.";
        alert("Silakan masukkan nomor Delivery Order!");
        return;
    }

    var pesanan = cariPesanan(nomorDO);
    if (pesanan === null) {
        hasil.hidden = true;
        pesanError.textContent = "Nomor DO " + nomorDO + " tidak ditemukan. Periksa kembali nomor yang Anda masukkan.";
        alert("Nomor DO tidak ditemukan!");
        return;
    }

    pesanError.textContent = "";
    tampilkanHasilTracking(pesanan);
}

function halamanTracking() {
    document.getElementById("formTracking").addEventListener("submit", function (event) {
        event.preventDefault();
        prosesCariTracking();
    });

    // kalau dibuka dari halaman checkout (tracking.html?do=xxxx), langsung cari
    var parameter = new URLSearchParams(window.location.search);
    var nomorDariUrl = parameter.get("do");
    if (nomorDariUrl !== null) {
        document.getElementById("inputDO").value = nomorDariUrl;
        prosesCariTracking();
    }
}


// ===== Halaman Laporan =====

// Membuat satu sel tabel berisi teks
function buatKolom(teks, namaClass) {
    var kolom = document.createElement("td");
    kolom.textContent = teks;
    if (namaClass) {
        kolom.className = namaClass;
    }
    return kolom;
}

function halamanLaporan() {
    var semuaPesanan = ambilSemuaPesanan();
    var isiLaporan = document.getElementById("isiLaporan");
    var totalKeseluruhan = 0;

    // tabel ringkasan semua pesanan
    semuaPesanan.forEach(function (pesanan, index) {
        var baris = document.createElement("tr");
        baris.appendChild(buatKolom(index + 1));
        baris.appendChild(buatKolom(pesanan.nomorDO));
        baris.appendChild(buatKolom(pesanan.nama));
        baris.appendChild(buatKolom(pesanan.tanggalKirim, "nowrap"));
        baris.appendChild(buatKolom(pesanan.ekspedisi));

        var kolomStatus = document.createElement("td");
        kolomStatus.appendChild(buatLabelStatus(pesanan.status));
        baris.appendChild(kolomStatus);

        baris.appendChild(buatKolom(pesanan.total, "kanan nowrap"));
        isiLaporan.appendChild(baris);

        totalKeseluruhan = totalKeseluruhan + ambilAngka(pesanan.total);
    });

    document.getElementById("jumlahPesanan").textContent = semuaPesanan.length;
    document.getElementById("totalKeseluruhan").textContent = formatRupiah(totalKeseluruhan);

    // rekap per buku dari transaksi checkout (data bawaan tidak punya rincian buku)
    var rekap = {};
    var transaksi = ambilTransaksi();
    for (var i = 0; i < transaksi.length; i++) {
        var items = transaksi[i].items;
        for (var j = 0; j < items.length; j++) {
            var kode = items[j].kodeBarang;
            if (rekap[kode] === undefined) {
                rekap[kode] = { namaBarang: items[j].namaBarang, jumlah: 0, pendapatan: 0 };
            }
            rekap[kode].jumlah = rekap[kode].jumlah + items[j].jumlah;
            rekap[kode].pendapatan = rekap[kode].pendapatan + items[j].jumlah * items[j].harga;
        }
    }

    var isiRekap = document.getElementById("isiRekapBuku");
    var nomor = 1;
    for (var kodeBuku in rekap) {
        var barisRekap = document.createElement("tr");
        barisRekap.appendChild(buatKolom(nomor));
        barisRekap.appendChild(buatKolom(kodeBuku));
        barisRekap.appendChild(buatKolom(rekap[kodeBuku].namaBarang));
        barisRekap.appendChild(buatKolom(rekap[kodeBuku].jumlah, "kanan"));
        barisRekap.appendChild(buatKolom(formatRupiah(rekap[kodeBuku].pendapatan), "kanan"));
        isiRekap.appendChild(barisRekap);
        nomor++;
    }

    if (nomor === 1) {
        var barisKosong = document.createElement("tr");
        var kolomKosong = buatKolom("Belum ada transaksi dari halaman Checkout.");
        kolomKosong.colSpan = 5;
        barisKosong.appendChild(kolomKosong);
        isiRekap.appendChild(barisKosong);
    }
}


// ===== Halaman History =====
function tampilkanHistory() {
    var semuaPesanan = ambilSemuaPesanan();

    // urutkan dari yang terbaru (tanggal lalu nomor DO)
    semuaPesanan.sort(function (a, b) {
        var kunciA = a.tanggalKirim + a.nomorDO;
        var kunciB = b.tanggalKirim + b.nomorDO;
        if (kunciA < kunciB) {
            return 1;
        }
        if (kunciA > kunciB) {
            return -1;
        }
        return 0;
    });

    var isiHistory = document.getElementById("isiHistory");
    isiHistory.innerHTML = "";

    semuaPesanan.forEach(function (pesanan) {
        var baris = document.createElement("tr");
        baris.appendChild(buatKolom(pesanan.tanggalKirim, "nowrap"));
        baris.appendChild(buatKolom(pesanan.nomorDO));
        baris.appendChild(buatKolom(pesanan.nama));

        // daftar buku yang dibeli
        var kolomBuku = document.createElement("td");
        if (pesanan.items) {
            var daftarBuku = document.createElement("ul");
            daftarBuku.className = "daftar-buku";
            pesanan.items.forEach(function (item) {
                var li = document.createElement("li");
                li.textContent = item.namaBarang + " (" + item.jumlah + "x)";
                daftarBuku.appendChild(li);
            });
            kolomBuku.appendChild(daftarBuku);
        } else {
            kolomBuku.textContent = "-";
        }
        baris.appendChild(kolomBuku);

        baris.appendChild(buatKolom(pesanan.pembayaran || "-"));
        baris.appendChild(buatKolom(pesanan.total, "kanan nowrap"));

        var kolomStatus = document.createElement("td");
        kolomStatus.appendChild(buatLabelStatus(pesanan.status));
        baris.appendChild(kolomStatus);

        var kolomAksi = document.createElement("td");
        var linkLacak = document.createElement("a");
        linkLacak.href = "tracking.html?do=" + pesanan.nomorDO;
        linkLacak.textContent = "Lacak";
        linkLacak.className = "tombol tombol-kecil";
        kolomAksi.appendChild(linkLacak);
        baris.appendChild(kolomAksi);

        isiHistory.appendChild(baris);
    });
}

function halamanHistory() {
    tampilkanHistory();

    document.getElementById("tombolHapusHistory").addEventListener("click", function () {
        if (ambilTransaksi().length === 0) {
            alert("Belum ada transaksi dari halaman Checkout.");
            return;
        }
        if (confirm("Hapus semua transaksi yang dibuat dari halaman Checkout?")) {
            localStorage.removeItem("transaksi");
            tampilkanHistory();
            alert("Transaksi checkout berhasil dihapus.");
        }
    });
}


// ===== Menjalankan fungsi sesuai halaman yang dibuka =====
document.addEventListener("DOMContentLoaded", function () {
    var halaman = document.body.id;

    if (halaman === "halaman-login") {
        halamanLogin();
        return;
    }

    // halaman selain login wajib sudah login
    if (!cekLogin()) {
        return;
    }
    aturLogout();

    if (halaman === "halaman-dashboard") {
        halamanDashboard();
    } else if (halaman === "halaman-stok") {
        halamanStok();
    } else if (halaman === "halaman-checkout") {
        halamanCheckout();
    } else if (halaman === "halaman-tracking") {
        halamanTracking();
    } else if (halaman === "halaman-laporan") {
        halamanLaporan();
    } else if (halaman === "halaman-history") {
        halamanHistory();
    }
});
