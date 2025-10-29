/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
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
import ZKupCard from "../components/ZKupCard";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import TextArea from "antd/es/input/TextArea";
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

function ZKup() {
  const user = JSON.parse(localStorage.getItem('baznas_userData'));

  const [loading, setLoading] = useState(false);
  const [geometry, setGeometry] = useState({ lng: '', lat: '' });
  
  // State untuk 3 gambar
  const [imageUrlDepan, setImageUrlDepan] = useState('');
  const [imageUrlSamping, setImageUrlSamping] = useState('');
  const [imageUrlBelakang, setImageUrlBelakang] = useState('');
  const [form] = Form.useForm();

  // Fungsi upload umum untuk semua
  const handleFileChange = async (e, tipe) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'h36o5eck'); // Ganti dengan preset Cloudinary Anda

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dnuyb460n/image/upload', // Ganti dengan cloud name Anda
        formData
      );

      if (response.status === 200) {
        const url = response.data.secure_url;
        if (tipe === 'depan') setImageUrlDepan(url);
        if (tipe === 'samping') setImageUrlSamping(url);
        if (tipe === 'belakang') setImageUrlBelakang(url);

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
      await instance.post('/zkup', {
        pengusul: values.pengusul,
        nama: values.nama,
        nik: values.nik,
        jumlah_keluarga: values.jumlahKeluarga,
        telepon: values.telepon,
        kabupaten: values.regency,
        kecamatan: values.district,
        desa: values.village,
        jenis_usaha: values.jenisUsaha,
        lokasi_usaha: values.lokasiUsaha,
        periode: values.periode,
        foto_usaha: imageUrlDepan,
        latitude: geometry?.lat || 0,
        longitude: geometry?.lng || 0,
        altitude: geometry?.alt || 0,
      });

      message.success('Data berhasil ditambahkan!');
      form.resetFields();
      setImageUrlDepan(null);
      fetchData();
    } catch (error) {
      console.error('Error adding data:', error);
      message.error('Gagal menambahkan data');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  // const [alamat, setAlamat] = useState('');
  // // const [kordinat, setKordinat] = useState('');

  // const handleAlamatChange = (e) => {
  //   setAlamat(e.target.value);
  // };

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

  const [selectedProvince, setSelectedProvince] = useState("52"); // Default ke 52
  const [selectedRegency, setSelectedRegency] = useState(null); // Default ke 5202
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [villages, setVillages] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [regencies, setRegencies] = useState([]);
  const [districts, setDistricts] = useState([]);

  // Fetch regencies saat komponen dimuat
  useEffect(() => {
    // Fetch provinces and filter for Nusa Tenggara Barat (ID = 17)
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

  // eslint-disable-next-line no-unused-vars
  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    setSelectedRegency(null);
    setSelectedDistrict(null);
    setVillages([]);

    // Fetch regencies for the selected province
    axios.get(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${value}.json`)
      .then(response => {
        setRegencies(response.data);
      })
      .catch(error => {
        console.error('Error fetching regencies:', error);
        message.error('Gagal memuat kabupaten/kota');
      });
  };

  // eslint-disable-next-line no-unused-vars
  const handleRegencyChange = (value) => {
    setSelectedRegency(value);
    setSelectedDistrict(null);
    setVillages([]);

    // Fetch districts for the selected regency
    axios.get(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${value}.json`)
      .then(response => {
        setDistricts(response.data);
      })
      .catch(error => {
        console.error('Error fetching districts:', error);
        message.error('Gagal memuat kecamatan');
      });
  };

  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);

    // Fetch villages for the selected district
    axios.get(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${value}.json`)
      .then(response => {
        setVillages(response.data);
      })
      .catch(error => {
        console.error('Error fetching villages:', error);
        message.error('Gagal memuat desa/kelurahan');
      });
  };

  const handleSave = () => {
    setGeometry({ lat: position.lat, lng: position.lng });
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
      const response = await instance.get('/zkup');
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
          <ZKupCard key={record.id} item={record} geoData={geoData} />
        </div>
      ),
      width: 900,
      centered: true,
    });
  };

  const handleDelete = async (id) => {
    try {
      await instance.delete(`/zkup/${id}`);
      message.success('Data berhasil dihapus');
      // Refresh data
      const updated = await instance.get('/zkup');
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
      village: record.desa,
      periode: record.periode,
      lat: record.latitude,
      lng: record.longitude,
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const updated = await editForm.validateFields();
      await instance.put(`/pendataan/${editData.id}`, updated);
      message.success('Data berhasil diperbarui');
      setEditModalVisible(false);
      // refresh data
      const { data } = await instance.get('/pendataan');
      setDataList(data.data);
    } catch (err) {
      message.error('Gagal memperbarui data');
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dataList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ZKup');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'data-zkup.xlsx');
  };

  const items = [
    {
      key: '1',
      label: 'Data ZKup',
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
                options={[...new Set(dataList.map((d) => d.pengusul))].map((i) => ({
                  label: i,
                  value: i,
                }))}
                style={{ minWidth: 200 }}
              />

              {/* 🏛️ Filter Kabupaten */}
              <Select
                placeholder="Filter Kabupaten"
                allowClear
                onChange={(val) => setFilters((prev) => ({ ...prev, kabupaten: val }))}
                options={[...new Set(dataList.map((d) => d.kabupaten))].map((i) => ({
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
            title={`Edit: ${editData?.nama}`}
            open={editModalVisible}
            onCancel={() => setEditModalVisible(false)}
            onOk={handleEditSubmit}
            width={800}
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
                  disabled={user.role !== 'admin'} // nonaktifkan jika bukan admin
                  placeholder="Pilih pengusul"
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
                disabled={user.role !== 'admin'} // nonaktifkan jika bukan admin
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

            <Form.Item
              label="Jenis Usaha"
              name="jenisUsaha"
              rules={[{ required: true, message: 'Jenis usaha harus diisi' }]}
            >
              <Input className="w-full" placeholder="Contoh: Warung Kelontong, Pertanian, Perternakan" />
            </Form.Item>

            <Form.Item
              label="Lokasi Usaha"
              name="lokasiUsaha"
              rules={[{ required: true, message: 'Lokasi usaha harus diisi' }]}
            >
              <TextArea className="w-full" placeholder="Alamat lengkap lokasi usaha" />
            </Form.Item>

            <Form.Item
              label="Periode"
              name="periode"
              rules={[{ required: false, message: 'Periode harus diisi' }]}
            >
              <Input className="w-full" placeholder="Periode" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <div>
                <Form.Item
                  label="Foto Usaha"
                  name="fotoUsaha"
                  rules={[{ required: true, message: 'Foto usaha depan diunggah' }]}
                >
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'depan')} />
                </Form.Item>
                {imageUrlDepan && <img src={imageUrlDepan} alt="Usaha" className="mt-2 w-full h-32 object-cover rounded" />}
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
        <h2 className="font-semibold text-2xl text-gray-700 mb-6">ZKup</h2>
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
      </section>
    </>
  )
}

export default ZKup