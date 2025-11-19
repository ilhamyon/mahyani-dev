/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, instance } from "../utils/auth";
import { Button, Form, Input, message, Modal, Popconfirm, Select, Table, Tabs, Tag } from "antd";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'antd/dist/reset.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import axios from "axios";
import PendataanCard from "../components/PendataanCard";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DeleteOutlined, EditOutlined, EyeOutlined, FileExcelOutlined } from "@ant-design/icons";

// Memperbaiki ikon marker
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// eslint-disable-next-line react/prop-types
const UpdateMapCenter = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, map.getZoom());
  }, [position, map]);

  return null;
};

const { Option } = Select;

function Home() {
  const [loading, setLoading] = useState(false);
  // const [geometry, setGeometry] = useState({ lng: '', lat: '' });
  const user = JSON.parse(localStorage.getItem('baznas_userData'));
  
  // State untuk 3 gambar
  const [imageUrlDepan, setImageUrlDepan] = useState('');
  const [imageUrlSamping, setImageUrlSamping] = useState('');
  const [imageUrlBelakang, setImageUrlBelakang] = useState('');
  const [imageUrlsProgress, setImageUrlsProgress] = useState({
    progress0depan: '',
    progress0samping: '',
    progress0belakang: '',
    progress50depan: '',
    progress50samping: '',
    progress50belakang: '',
    progress100depan: '',
    progress100samping: '',
    progress100belakang: '',
  });
  const [form] = Form.useForm();

  // Fungsi upload umum untuk semua
  const handleFileChange = async (e, tipe) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'h36o5eck'); // Ganti dengan preset Cloudinary kamu

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dnuyb460n/image/upload',
        formData
      );

      if (response.status === 200) {
        const url = response.data.secure_url;

        // ✅ Cek apakah tipe adalah progress atau utama
        if (['depan', 'samping', 'belakang'].includes(tipe)) {
          if (tipe === 'depan') setImageUrlDepan(url);
          if (tipe === 'samping') setImageUrlSamping(url);
          if (tipe === 'belakang') setImageUrlBelakang(url);
        } else {
          // untuk progress seperti 'progress0depan', 'progress50belakang', dll
          setImageUrlsProgress(prev => ({
            ...prev,
            [tipe]: url
          }));
        }

        message.success(`Foto ${tipe} berhasil diunggah`);
      } else {
        message.error(`Gagal mengunggah foto ${tipe}`);
      }
    } catch (error) {
      console.error(`Error upload foto ${tipe}:`, error);
      message.error(`Gagal upload foto ${tipe}`);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await instance.post('/pendataan', {
        pengusul: values.pengusul,
        nama: values.nama,
        nik: values.nik,
        jumlah_keluarga: values.jumlahKeluarga,
        telepon: values.telepon,
        kabupaten: values.regency,
        kecamatan: values.district,
        desa: values.village,
        kondisi_rumah: values.kondisiRumah,
        status_kepemilikan: values.statusKepemilikan,
        akses_air_bersih: values.airBersih,
        ketersediaan_mck: values.mck,
        tahun_realisasi: values.tahunRealisasi,
        foto_depan: imageUrlDepan,
        foto_samping: imageUrlSamping,
        foto_belakang: imageUrlBelakang,
        latitude: geometry?.lat || 0,
        longitude: geometry?.lng || 0,
        altitude: geometry?.alt || 0,
      });

      message.success('Data berhasil ditambahkan!');
      form.resetFields();
      setImageUrlDepan(null);
      setImageUrlSamping(null);
      setImageUrlBelakang(null);
      fetchData();
    } catch (error) {
      console.error('Error adding data:', error);
      message.error('Gagal menambahkan data');
    } finally {
      setLoading(false);
    }
  };

  const resetEditState = () => {
    editForm.resetFields();
    setImageUrlDepan('');
    setImageUrlSamping('');
    setImageUrlBelakang('');
    setImageUrlsProgress({
      progress0depan: '',
      progress0samping: '',
      progress0belakang: '',
      progress50depan: '',
      progress50samping: '',
      progress50belakang: '',
      progress100depan: '',
      progress100samping: '',
      progress100belakang: '',
    });
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  // const [alamat, setAlamat] = useState('');
  // // const [kordinat, setKordinat] = useState('');

  // const handleAlamatChange = (e) => {
  //   setAlamat(e.target.value);
  // };

  const [geometry, setGeometry] = useState({ lng: '', lat: '' });
  const [position, setPosition] = useState({ lat: -8.692290, lng: 116.183420 });

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition({ lat: latitude, lng: longitude });
          setGeometry({ lat: latitude, lng: longitude });
          message.success('Berhasil menyimpan titik lokasi');
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const [selectedProvince, setSelectedProvince] = useState("52");
  const [selectedRegency, setSelectedRegency] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState(null);

  const [provinces, setProvinces] = useState([]);
  const [villages, setVillages] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [districts, setDistricts] = useState([]);

  // Load provinces
  useEffect(() => {
    axios.get('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
      .then(response => {
        const ntbProvince = response.data.find(province => province.id === '52');
        if (ntbProvince) {
          setProvinces([ntbProvince]);
        } else {
          message.error('Provinsi Nusa Tenggara Barat tidak ditemukan.');
        }
      })
      .catch(error => {
        console.error('Error fetching provinces:', error);
        message.error('Gagal memuat provinsi');
      });
  }, []);

  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    setSelectedRegency(null);
    setSelectedDistrict(null);
    setSelectedVillage(null);
    setVillages([]);

    axios.get(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${value}.json`)
      .then(response => setRegencies(response.data))
      .catch(() => message.error('Gagal memuat kabupaten/kota'));
  };

  const handleRegencyChange = (value) => {
    console.log('Selected regency ID:', value);
    setSelectedRegency(value);
    setSelectedDistrict(null);
    setSelectedVillage(null);
    setVillages([]);

    axios.get(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${value}.json`)
      .then(response => setDistricts(response.data))
      .catch(() => message.error('Gagal memuat kecamatan'));
  };

  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);

    axios.get(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${value}.json`)
      .then(response => setVillages(response.data))
      .catch(() => message.error('Gagal memuat desa/kelurahan'));
  };

  // Mapping nama kemendagri -> nama OSM
  const regencyToOSM = {
    "Lombok Tengah": "Central Lombok",
    "Lombok Barat": "West Lombok",
    "Lombok Timur": "East Lombok",
    "Lombok Utara": "North Lombok",
    "Kota Mataram": "Mataram"
  };

  const handleVillageChange = async (value) => {
    setSelectedVillage(value);

    const villageName = villages.find(v => v.id === value)?.name;
    const regencyName = regencies.find(r => r.id === selectedRegency)?.name;

    if (!villageName || !regencyName) return;

    // Convert nama kabupaten agar sesuai format OSM
    const osmRegency = regencyToOSM[regencyName] || regencyName;

    const query = `${villageName}, ${osmRegency}, West Nusa Tenggara, Lesser Sunda Islands, Indonesia`;

    const url =
      `https://nominatim.openstreetmap.org/search?format=json&q=` +
      encodeURIComponent(query);

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        setPosition({ lat, lng });
        setGeometry({ lat, lng });

        message.success(`Map otomatis pindah ke ${villageName}`);
      } else {
        message.error("Koordinat desa tidak ditemukan");
      }
    } catch (err) {
      console.error(err);
      message.error("Gagal mencari koordinat desa");
    }
  };

  const handleSave = () => {
    setGeometry({ lat: position.lat, lng: position.lng });
    if (markerRef.current) {
      markerRef.current.closePopup();
    }
    message.success(`Berhasil menyimpan titik lokasi`);
  };

  const [dataList, setDataList] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [geoData, setGeoData] = useState({
    provinces: [],
    regencies: [],
    districts: [],
    villages: [],
  });

  const fetchData = async () => {
    setLoadingTable(true);
    try {
      const response = await instance.get('/pendataan');
      if (response.data?.data) {
        setDataList(response.data.data);
      }

      const result = response.data.data;

      const provinceIds = ['52']; // ID untuk NTB
      const regencyIds = [...new Set(result.map((item) => item.kabupaten))];
      const districtIds = [...new Set(result.map((item) => item.kecamatan))];
      // eslint-disable-next-line no-unused-vars
      const villageIds = [...new Set(result.map((item) => item.desa))];

      const [provinces, regencies, districts, villages] = await Promise.all([
        axios.get("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json").then((res) => res.data),

        Promise.all(
          provinceIds.map((id) =>
            axios
              .get(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${id}.json`)
              .then((res) => res.data)
          )
        ).then((data) => data.flat()),

        Promise.all(
          regencyIds.map((id) =>
            axios
              .get(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${id}.json`)
              .then((res) => res.data)
          )
        ).then((data) => data.flat()),

        Promise.all(
          districtIds.map((id) =>
            axios
              .get(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${id}.json`)
              .then((res) => res.data)
          )
        ).then((data) => data.flat()),
      ]);

      // 4. Set data wilayah
      setGeoData({ provinces, regencies, districts, villages });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onChange = key => {
    console.log(key);
  };
  const getNameById = (id, list) => list?.find((i) => i.id === id)?.name || '-';
  
  const columns = [
    {
      title: 'No.',
      key: 'no',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Nama',
      dataIndex: 'nama',
      key: 'nama',
      fixed: 'left',
    },
    {
      title: 'NIK',
      dataIndex: 'nik',
      key: 'nik',
    },
    {
      title: 'Pengusul',
      dataIndex: 'pengusul',
      key: 'pengusul',
    },
    {
      title: 'Wilayah',
      key: 'wilayah',
      render: (_, record) => (
        <div className="flex">
          {getNameById(record.desa, geoData.villages)}, {getNameById(record.kecamatan, geoData.districts)}, {getNameById(record.kabupaten, geoData.regencies)}
        </div>
      ),
    },
    {
      title: 'Tanggal',
      key: 'created_at',
      dataIndex: 'created_at',
      render: (val) => (val ? new Date(val).toLocaleDateString("id-ID") : "-"),
      width: 110,
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <div className="flex">
          <Tag
            color={
              record.status === 'Menunggu' ? 'yellow' :
              record.status === 'Disetujui' ? 'green' :
              record.status === 'Ditolak' ? 'red' :
              'default'
            }
          >
            {record.status}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Aksi',
      key: 'aksi',
      width: 120,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            size="small"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Yakin ingin hapus data ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Batal"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleView = (record) => {
    Modal.info({
      title: `Detail`,
      content: (
        <div className="mt-2">
          <PendataanCard key={record.id} item={record} geoData={geoData} />
        </div>
      ),
      width: 900,
      centered: true,
    });
  };

  const handleDelete = async (id) => {
    try {
      await instance.delete(`/pendataan/${id}`);
      message.success('Data berhasil dihapus');
      // Refresh data
      const updated = await instance.get('/pendataan');
      setDataList(updated.data.data);
    } catch (err) {
      message.error('Gagal menghapus data');
    }
  };

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editForm] = Form.useForm();
  const [filters, setFilters] = useState({ pengusul: '', kabupaten: '' });
  const [searchText, setSearchText] = useState('');
  const markerRef = useRef(null);

  const filteredData = dataList.filter(item =>
    (!filters.pengusul || item.pengusul === filters.pengusul) &&
    (!filters.kabupaten || item.kabupaten === filters.kabupaten) &&
    (!filters.status || item.status === filters.status) &&
    (!filters.tanggal || (item.created_at && new Date(item.created_at).getFullYear().toString() === filters.tanggal)) &&
    (
      item.nama?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.nik?.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const handleEdit = (record) => {
    setEditData(record);

    const posisi = {
      lat: record.latitude || 0,
      lng: record.longitude || 0,
    };
    setPosition(posisi);

    // Set ke Form
    editForm.setFieldsValue({
      ...record,
      jumlahKeluarga: record.jumlah_keluarga,
      kondisiRumah: record.kondisi_rumah,
      statusKepemilikan: record.status_kepemilikan,
      airBersih: record.akses_air_bersih,
      mck: record.ketersediaan_mck,
      province: '52',
      regency: record.kabupaten,
      district: record.kecamatan,
      tahunRealisasi: record.tahun_realisasi,
      village: record.desa,
      lat: posisi.lat,
      lng: posisi.lng,
    });

    // ✅ Set nilai gambar utama
    setImageUrlDepan(record.foto_depan || '');
    setImageUrlSamping(record.foto_samping || '');
    setImageUrlBelakang(record.foto_belakang || '');

    // ✅ Set nilai gambar progres
    setImageUrlsProgress({
      progress0depan: record.foto_progres_0_depan || '',
      progress0samping: record.foto_progres_0_samping || '',
      progress0belakang: record.foto_progres_0_belakang || '',
      progress50depan: record.foto_progres_50_depan || '',
      progress50samping: record.foto_progres_50_samping || '',
      progress50belakang: record.foto_progres_50_belakang || '',
      progress100depan: record.foto_progres_100_depan || '',
      progress100samping: record.foto_progres_100_samping || '',
      progress100belakang: record.foto_progres_100_belakang || '',
    });

    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();

      // Validasi titik lokasi
      if (!geometry?.lat || !geometry?.lng || geometry.lat === 0 || geometry.lng === 0) {
        message.error('Anda belum tentukan titik lokasi');
        return;
      }

      const payload = {
        pengusul: values.pengusul,
        nama: values.nama,
        nik: values.nik,
        jumlah_keluarga: values.jumlahKeluarga,
        telepon: values.telepon,
        kabupaten: values.regency,
        kecamatan: values.district,
        desa: values.village,
        kondisi_rumah: values.kondisiRumah,
        status_kepemilikan: values.statusKepemilikan,
        akses_air_bersih: values.airBersih,
        ketersediaan_mck: values.mck,
        tahun_realisasi: values.tahunRealisasi,
        foto_depan: imageUrlDepan,
        foto_samping: imageUrlSamping,
        foto_belakang: imageUrlBelakang,
        latitude: geometry.lat,
        longitude: geometry.lng,
        altitude: geometry?.alt || 0,

        // Foto Progres 0%
        foto_progres_0_depan: imageUrlsProgress.progress0depan,
        foto_progres_0_samping: imageUrlsProgress.progress0samping,
        foto_progres_0_belakang: imageUrlsProgress.progress0belakang,

        // Foto Progres 50%
        foto_progres_50_depan: imageUrlsProgress.progress50depan,
        foto_progres_50_samping: imageUrlsProgress.progress50samping,
        foto_progres_50_belakang: imageUrlsProgress.progress50belakang,

        // Foto Progres 100%
        foto_progres_100_depan: imageUrlsProgress.progress100depan,
        foto_progres_100_samping: imageUrlsProgress.progress100samping,
        foto_progres_100_belakang: imageUrlsProgress.progress100belakang,
      };

      await instance.put(`/pendataan/${editData.id}`, payload);

      message.success('Data berhasil diperbarui');
      setEditModalVisible(false);

      const { data } = await instance.get('/pendataan');
      setDataList(data.data);

      // Tutup popup peta
      setTimeout(() => {
        document.querySelector('.leaflet-popup-close-button')?.click();
      }, 100);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error('Gagal memperbarui data');
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dataList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mahyani');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'data-mahyani.xlsx');
  };
  console.log('position:', position)
  const mapRef = useRef(null);
  useEffect(() => {
    if (editModalVisible && mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 300);
    }
  }, [editModalVisible]);
  useEffect(() => {
    if (editModalVisible) {
      setTimeout(() => {
        const map = window.L?.map?.instances?.[0];
        map?.invalidateSize();
      }, 600);
    }
  }, [editModalVisible]);

  const items = [
    {
      key: '1',
      label: 'Data Mahyani',
      children: (
        <div className="bg-white p-4 rounded-lg">
          <div className="lg:flex hidden justify-between gap-4 mb-4">
            <div className="flex gap-2">
              {/* 🔍 Pencarian Nama atau NIK */}
              <Input
                placeholder="Cari Nama atau NIK"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
              />

              {/* 🧩 Filter Pengusul */}
              <Select
                placeholder="Filter Pengusul"
                allowClear
                onChange={(val) => setFilters((prev) => ({ ...prev, pengusul: val }))}
                options={[
                  ...new Set(dataList.map((d) => d.pengusul)),
                ].map((i) => ({ label: i, value: i }))}
                style={{ minWidth: 200 }}
              />

              {/* 🏛️ Filter Kabupaten */}
              <Select
                placeholder="Filter Kabupaten"
                allowClear
                onChange={(val) => setFilters((prev) => ({ ...prev, kabupaten: val }))}
                options={[
                  ...new Set(dataList.map((d) => d.kabupaten)),
                ].map((i) => ({
                  label: getNameById(i, geoData.regencies),
                  value: i,
                }))}
                style={{ minWidth: 250 }}
              />

              {/* 📅 Filter Tahun berdasarkan created_at */}
              <Select
                placeholder="Filter Tahun"
                allowClear
                onChange={(val) => setFilters((prev) => ({ ...prev, tahun: val }))}
                options={[
                  ...new Set(
                    dataList
                      .map((d) => {
                        if (!d.created_at) return null;
                        const year = new Date(d.created_at).getFullYear();
                        return !isNaN(year) ? year : null;
                      })
                      .filter(Boolean)
                  ),
                ]
                  .sort((a, b) => b - a)
                  .map((year) => ({ label: year, value: year }))}
                style={{ minWidth: 110 }}
              />

              {/* 🎨 Filter Status */}
              <Select
                placeholder="Filter Status"
                allowClear
                onChange={(val) => setFilters((prev) => ({ ...prev, status: val }))}
                options={[
                  { label: "Menunggu", value: "Menunggu" },
                  { label: "Disetujui", value: "Disetujui" },
                  { label: "Ditolak", value: "Ditolak" },
                ]}
                style={{ minWidth: 150 }}
              />
            </div>
            <div>
              {/* 📄 Export */}
              <Button
                className="bg-green-700 text-white"
                onClick={exportToExcel}
                icon={<FileExcelOutlined />}
              >
                Export ke Excel
              </Button>

              {/* 🔁 Refresh */}
              {/* <Button
                className="bg-blue-600 text-white"
                onClick={() => {
                  fetchData(); // fungsi untuk ambil ulang data
                  message.success("Data diperbarui");
                }}
              >
                Refresh
              </Button> */}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              scroll={{ x: 1000 }}
              pagination={{ pageSize: 10 }}
              loading={loadingTable}
            />
          </div>

          <Modal
            onCancel={() => {
              setEditModalVisible(false);
              resetEditState();
              setTimeout(() => {
                document.querySelector('.leaflet-popup-close-button')?.click();
              }, 100); // memastikan DOM ada
            }}
            title={`Edit: ${editData?.nama}`}
            open={editModalVisible}
            // onCancel={() => setEditModalVisible(false)}
            onOk={handleEditSubmit}
            width={950}
            centered
          >
            <Form layout="vertical" form={editForm}>
              <Form.Item
                label="Pengusul"
                name="pengusul"
                rules={[{ required: true, message: 'Pengusul harus diisi' }]}
              >
                <Select
                  className="w-full"
                  placeholder="Pilih pengusul"
                  disabled={user.role !== 'admin'} // nonaktifkan jika bukan admin
                  options={[
                    {
                      value: 'BAZNAS Mataram',
                      label: 'BAZNAS Mataram',
                    },
                    {
                      value: 'BAZNAS Lombok Barat',
                      label: 'BAZNAS Lombok Barat',
                    },
                    {
                      value: 'BAZNAS Lombok Utara',
                      label: 'BAZNAS Lombok Utara',
                    },
                    {
                      value: 'BAZNAS Lombok Tengah',
                      label: 'BAZNAS Lombok Tengah',
                    },
                    {
                      value: 'BAZNAS Lombok Timur',
                      label: 'BAZNAS Lombok Timur',
                    },
                    {
                      value: 'BAZNAS Sumbawa',
                      label: 'BAZNAS Sumbawa',
                    },
                    {
                      value: 'BAZNAS Sumbawa Barat',
                      label: 'BAZNAS Sumbawa Barat',
                    },
                    {
                      value: 'BAZNAS Dompu',
                      label: 'BAZNAS Dompu',
                    },
                    {
                      value: 'BAZNAS Bima',
                      label: 'BAZNAS Bima',
                    },
                    {
                      value: 'BAZNAS Kota Bima',
                      label: 'BAZNAS Kota Bima',
                    },
                    {
                      value: 'Lainnya',
                      label: 'Lainnya',
                    },
                  ]}
                />
              </Form.Item>

              <div className="flex gap-4 w-full">
                <Form.Item
                  label="Nama"
                  name="nama"
                  rules={[{ required: true, message: 'Nama harus diisi' }]}
                  className="flex-grow"
                >
                  <Input className="w-full" />
                </Form.Item>

                <Form.Item
                  label="NIK"
                  name="nik"
                  rules={[{ required: true, message: 'NIK harus diisi' }]}
                  className="flex-grow"
                >
                  <Input className="w-full" />
                </Form.Item>
              </div>

              <div className="flex gap-4 w-full">
                <Form.Item
                  label="Jumlah Keluarga"
                  name="jumlahKeluarga"
                  rules={[{ required: true, message: 'Jumlah Keluarga harus diisi' }]}
                  className="flex-grow"
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Telepon"
                  name="telepon"
                  rules={[{ required: true, message: 'Telepon harus diisi' }]}
                  className="flex-grow"
                >
                  <Input />
                </Form.Item>
              </div>

              <div className="flex flex-col w-full">
                {/* Baris 1: Provinsi & Kabupaten/Kota */}
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <div className="flex-1">
                    <Form.Item
                      label="Provinsi"
                      name="province"
                      rules={[{ required: true, message: 'Provinsi harus dipilih' }]}
                    >
                      <Select onChange={handleProvinceChange} placeholder="Pilih Provinsi">
                        {provinces.map(province => (
                          <Option key={province.id} value={province.id}>
                            {province.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>

                  <div className="flex-1">
                    <Form.Item
                      label="Kabupaten/Kota"
                      name="regency"
                      rules={[{ required: true, message: 'Kabupaten/Kota harus dipilih' }]}
                    >
                      <Select
                        onChange={handleRegencyChange}
                        placeholder="Pilih Kabupaten/Kota"
                        disabled={!selectedProvince}
                      >
                        {regencies.map(regency => (
                          <Option key={regency.id} value={regency.id}>
                            {regency.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </div>

                {/* Baris 2: Kecamatan & Desa/Kelurahan */}
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <div className="flex-1">
                    <Form.Item
                      label="Kecamatan"
                      name="district"
                      rules={[{ required: true, message: 'Kecamatan harus dipilih' }]}
                    >
                      <Select
                        onChange={handleDistrictChange}
                        placeholder="Pilih Kecamatan"
                        disabled={!selectedRegency}
                      >
                        {districts.map(district => (
                          <Option key={district.id} value={district.id}>
                            {district.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>

                  <div className="flex-1">
                    <Form.Item
                      label="Desa/Kelurahan"
                      name="village"
                      rules={[{ required: true, message: 'Desa/Kelurahan harus dipilih' }]}
                    >
                      <Select
                        placeholder="Pilih Desa/Kelurahan"
                        disabled={!selectedDistrict}
                        onChange={handleVillageChange}
                      >
                        {villages.map(village => (
                          <Option key={village.id} value={village.id}>
                            {village.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </div>
              </div>

              <Form.Item
                label="Input Kordinat (Klik Gunakan Lokasi Saat Ini atau Anda Juga Bisa Menentukan Titik Sendiri di Map)"
                name="position"
              >
                <div className="mb-4">
                  <Button className="bg-green-600 text-white" onClick={handleUseCurrentLocation}>Gunakan Lokasi Saat Ini</Button>
                </div>
                <div>
                  <MapContainer
                    center={position}
                    zoom={13}
                    style={{ height: '60vh', width: '100%' }}
                  >
                    <ResizeMapOnModalOpen visible={editModalVisible} />
                    <UpdateMapCenter position={position} />
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker
                      position={position}
                      draggable={true}
                      eventHandlers={{
                        dragend(event) {
                          setPosition(event.target.getLatLng());
                        },
                      }}
                    >
                      <Popup>
                        <div>
                          <p>Latitude: {position.lat.toFixed(4)}</p>
                          <p>Longitude: {position.lng.toFixed(4)}</p>
                          <Button
                            className="bg-green-600 text-white"
                            // onClick={handleSave}
                            onClick={() => {
                              handleSave();
                              setTimeout(() => {
                                document.querySelector('.leaflet-popup-close-button')?.click();
                              }, 100); // memastikan DOM ada
                            }}
                          >
                            Simpan Titik
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>

                </div>
              </Form.Item>
              <div className="text-gray-400 text-xs -mt-4 mb-6">
                {position.lat && position.lng && (
                  <p>({position.lat}, {position.lng})</p>
                )}
                {/* <p>{geometry}</p> */}
              </div>

              <div className="flex flex-col w-full">
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <div className="flex-1">
                    <Form.Item
                      label="Kondisi Rumah"
                      name="kondisiRumah"
                      rules={[{ required: true, message: 'Kondisi rumah harus diisi' }]}
                    >
                      <Select
                        className="w-full"
                        placeholder="Pilih kondisi"
                        options={[
                          { value: 'Rusak Ringan', label: 'Rusak Ringan' },
                          { value: 'Rusak Sedang', label: 'Rusak Sedang' },
                          { value: 'Rusak Berat', label: 'Rusak Berat' },
                        ]}
                      />
                    </Form.Item>
                  </div>

                  <div className="flex-1">
                    <Form.Item
                      label="Status Kepemilikan"
                      name="statusKepemilikan"
                      rules={[{ required: true, message: 'Status kepemilikan harus diisi' }]}
                    >
                      <Select
                        className="w-full"
                        placeholder="Pilih status"
                        options={[
                          { value: 'Milik Sendiri', label: 'Milik Sendiri' },
                          { value: 'Sewa', label: 'Sewa' },
                          { value: 'Menumpang', label: 'Menumpang' },
                        ]}
                      />
                    </Form.Item>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <div className="flex-1">
                    <Form.Item
                      label="Akses Air Bersih"
                      name="airBersih"
                      rules={[{ required: true, message: 'Akses air bersih harus diisi' }]}
                    >
                      <Select
                        className="w-full"
                        placeholder="Pilih"
                        options={[
                          { value: 'Ada', label: 'Ada' },
                          { value: 'Tidak Ada', label: 'Tidak Ada' },
                        ]}
                      />
                    </Form.Item>
                  </div>

                  <div className="flex-1">
                    <Form.Item
                      label="Ketersediaan MCK"
                      name="mck"
                      rules={[{ required: true, message: 'Ketersediaan MCK harus diisi' }]}
                    >
                      <Select
                        className="w-full"
                        placeholder="Pilih"
                        options={[
                          { value: 'Ada', label: 'Ada' },
                          { value: 'Tidak Ada', label: 'Tidak Ada' },
                        ]}
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              <Form.Item
                label="Tahun Realisasi"
                name="tahunRealisasi"
                rules={[
                  { required: false, message: 'Tahun realisasi harus diisi' },
                  {
                    pattern: /^\d{4}$/,
                    message: 'Masukkan tahun dengan format 4 digit (contoh: 2025)',
                  },
                ]}
              >
                <Input placeholder="Masukkan tahun, contoh: 2025" maxLength={4} />
              </Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <div>
                  <Form.Item
                    label="Foto Rumah Depan"
                    name="fotoDepan"
                    rules={[{ required: false, message: 'Foto rumah depan diunggah' }]}
                  >
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'depan')} />
                  </Form.Item>
                  {imageUrlDepan && <img src={imageUrlDepan} alt="Depan" className="mt-2 w-full h-32 object-cover rounded" />}
                </div>

                <div>
                  <Form.Item
                    label="Foto Rumah Samping"
                    name="fotoSamping"
                    rules={[{ required: false, message: 'Foto rumah samping diunggah' }]}
                  >
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'samping')} />
                  </Form.Item>
                  {imageUrlSamping && <img src={imageUrlSamping} alt="Samping" className="mt-2 w-full h-32 object-cover rounded" />}
                </div>

                <div>
                  <Form.Item
                    label="Foto Rumah Belakang"
                    name="fotoBelakang"
                    rules={[{ required: false, message: 'Foto rumah belakang diunggah' }]}
                  >
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'belakang')} />
                  </Form.Item>
                  {imageUrlBelakang && <img src={imageUrlBelakang} alt="Belakang" className="mt-2 w-full h-32 object-cover rounded" />}
                </div>
              </div>

              <h3 className="mt-6 mb-2 font-semibold text-gray-700">Foto Progres</h3>

              <div className="space-y-6">
                {['0', '50', '100'].map((persen) => (
                  <div key={`progress-${persen}`}>
                    <h4 className="font-medium text-sm mb-2">Progress {persen}%</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['depan', 'samping', 'belakang'].map((posisi) => (
                        <div key={`progress-${persen}-${posisi}`}>
                          <Form.Item
                            label={`Foto ${posisi.charAt(0).toUpperCase() + posisi.slice(1)}`}
                            name={`fotoProgress${persen}${posisi}`}
                            rules={[{ required: false, message: `Foto ${posisi} ${persen}% harus diunggah` }]}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, `progress${persen}${posisi}`)}
                            />
                          </Form.Item>
                          {imageUrlsProgress[`progress${persen}${posisi}`] && (
                            <img
                              src={imageUrlsProgress[`progress${persen}${posisi}`]}
                              alt={`Foto ${posisi} ${persen}%`}
                              className="mt-2 w-full h-32 object-cover rounded"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Form.Item
                label="Longitude"
                name="lng"
                initialValue={geometry.lng}
                hidden
              >
                <Input disabled />
              </Form.Item>

              <Form.Item
                label="Latitude"
                name="lat"
                initialValue={geometry.lat}
                hidden
              >
                <Input disabled />
              </Form.Item>
            </Form>
          </Modal>

        </div>
      ),
    },
    {
      key: '2',
      label: 'Tambah Data',
      children: (
        <div className="lg:px-20 lg:py-20 px-4 bg-white rounded-lg">
          <Form
            form={form}
            name="addDataForm"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            layout="vertical"
            size="large"
          >
            <Form.Item
              label="Pengusul"
              name="pengusul"
              rules={[{ required: true, message: 'Pengusul harus diisi' }]}
              initialValue={user.role !== 'admin' ? user.pengusul : undefined}
            >
              <Select
                className="w-full"
                placeholder="Pilih pengusul"
                options={[
                  {
                    value: 'BAZNAS Prov NTB',
                    label: 'BAZNAS Prov NTB',
                  },
                  {
                    value: 'BAZNAS Mataram',
                    label: 'BAZNAS Mataram',
                  },
                  {
                    value: 'BAZNAS Lombok Barat',
                    label: 'BAZNAS Lombok Barat',
                  },
                  {
                    value: 'BAZNAS Lombok Utara',
                    label: 'BAZNAS Lombok Utara',
                  },
                  {
                    value: 'BAZNAS Lombok Tengah',
                    label: 'BAZNAS Lombok Tengah',
                  },
                  {
                    value: 'BAZNAS Lombok Timur',
                    label: 'BAZNAS Lombok Timur',
                  },
                  {
                    value: 'BAZNAS Sumbawa',
                    label: 'BAZNAS Sumbawa',
                  },
                  {
                    value: 'BAZNAS Sumbawa Barat',
                    label: 'BAZNAS Sumbawa Barat',
                  },
                  {
                    value: 'BAZNAS Dompu',
                    label: 'BAZNAS Dompu',
                  },
                  {
                    value: 'BAZNAS Bima',
                    label: 'BAZNAS Bima',
                  },
                  {
                    value: 'BAZNAS Kota Bima',
                    label: 'BAZNAS Kota Bima',
                  },
                  {
                    value: 'Lainnya',
                    label: 'Lainnya',
                  },
                ]}
                disabled={user.role !== 'admin'} // nonaktifkan jika bukan admin
              />
            </Form.Item>

            <div className="flex gap-4 w-full">
              <Form.Item
                label="Nama"
                name="nama"
                rules={[{ required: true, message: 'Nama harus diisi' }]}
                className="flex-grow"
              >
                <Input className="w-full" />
              </Form.Item>

              <Form.Item
                label="NIK"
                name="nik"
                rules={[{ required: true, message: 'NIK harus diisi' }]}
                className="flex-grow"
              >
                <Input className="w-full" />
              </Form.Item>
            </div>

            <div className="flex gap-4 w-full">
              <Form.Item
                label="Jumlah Keluarga"
                name="jumlahKeluarga"
                rules={[{ required: true, message: 'Jumlah Keluarga harus diisi' }]}
                className="flex-grow"
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Telepon"
                name="telepon"
                rules={[{ required: true, message: 'Telepon harus diisi' }]}
                className="flex-grow"
              >
                <Input />
              </Form.Item>
            </div>

            <div className="flex flex-col w-full">
              {/* Baris 1: Provinsi & Kabupaten/Kota */}
              <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="flex-1">
                  <Form.Item
                    label="Provinsi"
                    name="province"
                    rules={[{ required: true, message: 'Provinsi harus dipilih' }]}
                  >
                    <Select onChange={handleProvinceChange} placeholder="Pilih Provinsi">
                      {provinces.map(province => (
                        <Option key={province.id} value={province.id}>
                          {province.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                <div className="flex-1">
                  <Form.Item
                    label="Kabupaten/Kota"
                    name="regency"
                    rules={[{ required: true, message: 'Kabupaten/Kota harus dipilih' }]}
                  >
                    <Select
                      onChange={handleRegencyChange}
                      placeholder="Pilih Kabupaten/Kota"
                      disabled={!selectedProvince}
                    >
                      {regencies.map(regency => (
                        <Option key={regency.id} value={regency.id}>
                          {regency.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>

              {/* Baris 2: Kecamatan & Desa/Kelurahan */}
              <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="flex-1">
                  <Form.Item
                    label="Kecamatan"
                    name="district"
                    rules={[{ required: true, message: 'Kecamatan harus dipilih' }]}
                  >
                    <Select
                      onChange={handleDistrictChange}
                      placeholder="Pilih Kecamatan"
                      disabled={!selectedRegency}
                    >
                      {districts.map(district => (
                        <Option key={district.id} value={district.id}>
                          {district.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                <div className="flex-1">
                  <Form.Item
                    label="Desa/Kelurahan"
                    name="village"
                    rules={[{ required: true, message: 'Desa/Kelurahan harus dipilih' }]}
                  >
                    <Select
                      placeholder="Pilih Desa/Kelurahan"
                      disabled={!selectedDistrict}
                      onChange={handleVillageChange}
                    >
                      {villages.map(village => (
                        <Option key={village.id} value={village.id}>
                          {village.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>
            </div>

            <Form.Item
              label="Input Kordinat (Klik Gunakan Lokasi Saat Ini atau Anda Juga Bisa Menentukan Titik Sendiri di Map)"
              name="position"
            >
              <div className="mb-4">
                <Button className="bg-green-600 text-white" onClick={handleUseCurrentLocation}>Gunakan Lokasi Saat Ini</Button>
              </div>
              <div>
                <MapContainer center={position} zoom={13} style={{ height: '60vh', width: '100%' }}>
                  <UpdateMapCenter position={position} />
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker
                    position={position}
                    draggable={true}
                    eventHandlers={{
                      dragend(event) {
                        setPosition(event.target.getLatLng());
                      },
                    }}
                  >
                    <Popup>
                      <div>
                        <p>Latitude: {position.lat.toFixed(4)}</p>
                        <p>Longitude: {position.lng.toFixed(4)}</p>
                        <Button className="bg-green-600 text-white" onClick={handleSave}>Simpan Titik</Button>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </Form.Item>
            <div className="text-gray-400 text-xs -mt-4 mb-6">
              {position.lat && position.lng && (
                <p>({position.lat}, {position.lng})</p>
              )}
              {/* <p>{geometry}</p> */}
            </div>

            <div className="flex flex-col w-full">
              <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="flex-1">
                  <Form.Item
                    label="Kondisi Rumah"
                    name="kondisiRumah"
                    rules={[{ required: true, message: 'Kondisi rumah harus diisi' }]}
                  >
                    <Select
                      className="w-full"
                      placeholder="Pilih kondisi"
                      options={[
                        { value: 'Rusak Ringan', label: 'Rusak Ringan' },
                        { value: 'Rusak Sedang', label: 'Rusak Sedang' },
                        { value: 'Rusak Berat', label: 'Rusak Berat' },
                      ]}
                    />
                  </Form.Item>
                </div>

                <div className="flex-1">
                  <Form.Item
                    label="Status Kepemilikan"
                    name="statusKepemilikan"
                    rules={[{ required: true, message: 'Status kepemilikan harus diisi' }]}
                  >
                    <Select
                      className="w-full"
                      placeholder="Pilih status"
                      options={[
                        { value: 'Milik Sendiri', label: 'Milik Sendiri' },
                        { value: 'Sewa', label: 'Sewa' },
                        { value: 'Menumpang', label: 'Menumpang' },
                      ]}
                    />
                  </Form.Item>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="flex-1">
                  <Form.Item
                    label="Akses Air Bersih"
                    name="airBersih"
                    rules={[{ required: true, message: 'Akses air bersih harus diisi' }]}
                  >
                    <Select
                      className="w-full"
                      placeholder="Pilih"
                      options={[
                        { value: 'Ada', label: 'Ada' },
                        { value: 'Tidak Ada', label: 'Tidak Ada' },
                      ]}
                    />
                  </Form.Item>
                </div>

                <div className="flex-1">
                  <Form.Item
                    label="Ketersediaan MCK"
                    name="mck"
                    rules={[{ required: true, message: 'Ketersediaan MCK harus diisi' }]}
                  >
                    <Select
                      className="w-full"
                      placeholder="Pilih"
                      options={[
                        { value: 'Ada', label: 'Ada' },
                        { value: 'Tidak Ada', label: 'Tidak Ada' },
                      ]}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>

            <Form.Item
              label="Tahun Realisasi"
              name="tahunRealisasi"
              rules={[
                { required: false, message: 'Tahun realisasi harus diisi' },
                {
                  pattern: /^\d{4}$/,
                  message: 'Masukkan tahun dengan format 4 digit (contoh: 2025)',
                },
              ]}
            >
              <Input placeholder="Masukkan tahun, contoh: 2025" maxLength={4} />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <div>
                <Form.Item
                  label="Foto Rumah Depan"
                  name="fotoDepan"
                  rules={[{ required: true, message: 'Foto rumah depan diunggah' }]}
                >
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'depan')} />
                </Form.Item>
                {imageUrlDepan && <img src={imageUrlDepan} alt="Depan" className="mt-2 w-full h-32 object-cover rounded" />}
              </div>

              <div>
                <Form.Item
                  label="Foto Rumah Samping"
                  name="fotoSamping"
                  rules={[{ required: true, message: 'Foto rumah samping diunggah' }]}
                >
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'samping')} />
                </Form.Item>
                {imageUrlSamping && <img src={imageUrlSamping} alt="Samping" className="mt-2 w-full h-32 object-cover rounded" />}
              </div>

              <div>
                <Form.Item
                  label="Foto Rumah Belakang"
                  name="fotoBelakang"
                  rules={[{ required: true, message: 'Foto rumah belakang diunggah' }]}
                >
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'belakang')} />
                </Form.Item>
                {imageUrlBelakang && <img src={imageUrlBelakang} alt="Belakang" className="mt-2 w-full h-32 object-cover rounded" />}
              </div>
            </div>

            <Form.Item
              label="Longitude"
              name="lng"
              initialValue={geometry.lng}
              hidden
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              label="Latitude"
              name="lat"
              initialValue={geometry.lat}
              hidden
            >
              <Input disabled />
            </Form.Item>

            <Form.Item>
              <Button className="bg-green-600 text-white mt-4 px-10" htmlType="submit" loading={loading} disabled={!imageUrlDepan || !geometry}>
                Kirim
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
  ];
  return (
    <>
      <section id="input-lokasi" className="text-gray-600 py-10 lg:px-32 px-4 mb-10 bg-gray-100">
        <h2 className="font-semibold text-2xl text-gray-700 mb-6">Mahyani</h2>
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
      </section>
    </>
  )
}

// eslint-disable-next-line react/prop-types
const ResizeMapOnModalOpen = ({ visible }) => {
  const map = useMap();

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        map.invalidateSize();
      }, 50); // waktu tunggu agar modal selesai transisi
    }
  }, [visible, map]);

  return null;
};


export default Home