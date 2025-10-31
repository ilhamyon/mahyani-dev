/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useState, useMemo } from "react";
import { Table, Button, Modal, Image, Tag, message, Spin, Popconfirm, Card, Collapse, Row, Col } from "antd";
import { instance } from "../utils/auth";
import axios from "axios";
import { CheckOutlined, CloseOutlined, EyeOutlined, InfoCircleOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

const DetailModal = ({ visible, onClose, record, loading }) => {
  if (!record) return null;
  return (
    <Modal
      title={
        <span className="flex items-center gap-2">
          <InfoCircleOutlined style={{ color: '#1890ff' }} />
          Detail
        </span>
      }
      open={visible}
      onCancel={onClose}
      footer={[<Button key="close" onClick={onClose}>Tutup</Button>]}
      width={900}
      centered
    >
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin tip="Memuat detail..." />
        </div>
      ) : (
        <Card
          title={record.nama || 'N/A'}
          bordered={false}
          style={{
            marginBottom: 24,
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
          headStyle={{ backgroundColor: '#f5f5f5' }}
        >
          <Row gutter={[16, 12]}>
            {/* Kolom kiri */}
            <Col xs={24} md={12}>
              <p><strong>NIK:</strong> {record.nik}</p>
              <p><strong>Jumlah Keluarga:</strong> {record.jumlah_keluarga}</p>
              <p><strong>Telepon:</strong> {record.telepon}</p>
              <p>
                <strong>Alamat:</strong><br />
                {[record.desa, record.kecamatan, record.kabupaten].filter(Boolean).join(', ')}
              </p>
              <p><strong>Pengusul:</strong> {record.pengusul}</p>
            </Col>

            {/* Kolom kanan */}
            <Col xs={24} md={12}>
              {record.sumber === "pendataan" ? (
                <>
                  <p><strong>Kondisi Rumah:</strong> <Tag color="orange">{record.kondisi_rumah}</Tag></p>
                  <p><strong>Status Kepemilikan:</strong> <Tag color="blue">{record.status_kepemilikan}</Tag></p>
                  <p>
                    <strong>Akses Air Bersih:</strong>{" "}
                    <Tag
                      color={
                        record.akses_air_bersih === "Menunggu"
                          ? "yellow"
                          : record.akses_air_bersih === "Disetujui"
                          ? "green"
                          : record.akses_air_bersih === "Ditolak"
                          ? "red"
                          : "default"
                      }
                    >
                      {record.akses_air_bersih}
                    </Tag>
                  </p>
                  <p>
                    <strong>Ketersediaan MCK:</strong>{" "}
                    <Tag color={record.ketersediaan_mck === "Ada" ? "green" : "red"}>
                      {record.ketersediaan_mck}
                    </Tag>
                  </p>
                  <p>
                    <strong>Tahun Realisasi:</strong> {record.tahun_realisasi || "-"}
                  </p>
                </>
              ) : record.sumber === "zkup" ? (
                <>
                  <p><strong>Jenis Usaha:</strong> {record.jenis_usaha || "-"}</p>
                  <p><strong>Lokasi Usaha:</strong> {record.lokasi_usaha || "-"}</p>
                  <p><strong>Periode:</strong> {record.periode || "-"}</p>
                </>
              ) : (
                <p className="text-gray-400 italic">Sumber data tidak dikenal</p>
              )}
            </Col>
          </Row>

          {/* Foto Rumah */}
          {(record.foto_depan || record.foto_samping || record.foto_belakang || record.foto_usaha) && (
            <Collapse ghost style={{ marginTop: 24 }}>
              {/* Foto Rumah */}
              {(record.foto_depan || record.foto_samping || record.foto_belakang) && (
                <Panel header="Lihat Foto Rumah" key="foto-rumah">
                  <Row gutter={[12, 12]} style={{ marginTop: 8 }}>
                    {['depan', 'samping', 'belakang'].map((pos) =>
                      record[`foto_${pos}`] ? (
                        <Col xs={24} sm={8} key={pos}>
                          <Image
                            src={record[`foto_${pos}`]}
                            alt={pos}
                            style={{ width: '100%', borderRadius: 8, objectFit: 'cover', height: 100 }}
                          />
                          <p style={{ textAlign: 'center', marginTop: 4, textTransform: 'capitalize' }}>{pos}</p>
                        </Col>
                      ) : null
                    )}
                  </Row>
                </Panel>
              )}

              {/* Foto Usaha (jika sumber zkup) */}
              {record.sumber === 'zkup' && record.foto_usaha && (
                <Panel header="Lihat Foto Usaha" key="foto-usaha">
                  <Row gutter={[12, 12]} style={{ marginTop: 8 }}>
                    <Col xs={24} sm={8}>
                      <Image
                        src={record.foto_usaha}
                        alt="foto_usaha"
                        style={{ width: '100%', borderRadius: 8, objectFit: 'cover', height: 100 }}
                      />
                      <p style={{ textAlign: 'center', marginTop: 4 }}>Usaha</p>
                    </Col>
                  </Row>
                </Panel>
              )}
            </Collapse>
          )}
        </Card>
      )}
    </Modal>
  );
};

function Verifikasi() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [detailRecord, setDetailRecord] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [geoData, setGeoData] = useState({ regencies: [], districts: [], villages: [], maps: {} });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await instance.get("/verifikasi/menunggu");
      setData(res.data?.data || []);
    } catch (err) {
      message.error("Gagal memuat data verifikasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const fetchWilayah = async () => {
      try {
        const regencies = (await axios.get("https://www.emsifa.com/api-wilayah-indonesia/api/regencies/52.json")).data;
        const districts = (await Promise.all(
          regencies.map((r) =>
            axios
              .get(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${r.id}.json`)
              .then((res) => res.data)
              .catch(() => [])
          )
        )).flat();
        const villages = (await Promise.all(
          districts.map((d) =>
            axios
              .get(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${d.id}.json`)
              .then((res) => res.data)
              .catch(() => [])
          )
        )).flat();

        const regencyMap = Object.fromEntries(regencies.map((r) => [String(r.id), r.name]));
        const districtMap = Object.fromEntries(districts.map((d) => [String(d.id), d.name]));
        const villageMap = Object.fromEntries(villages.map((v) => [String(v.id), v.name]));
        setGeoData({ regencies, districts, villages, maps: { regencyMap, districtMap, villageMap } });
      } catch {
        message.error("Gagal memuat wilayah NTB");
      }
    };
    fetchWilayah();
  }, []);

  const handleView = async (record, sumberParam) => {
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const sumber = sumberParam || record.sumber;
      let listRes;
      if (sumber === "pendataan") listRes = await instance.get("/pendataan");
      else if (sumber === "zkup") listRes = await instance.get("/zkup");

      const allData = listRes?.data?.data || [];
      const found = allData.find((item) => item.id === record.id);
      if (found) {
        const { maps } = geoData;
        found.kabupaten = maps?.regencyMap?.[String(found.kabupaten)] || found.kabupaten;
        found.kecamatan = maps?.districtMap?.[String(found.kecamatan)] || found.kecamatan;
        found.desa = maps?.villageMap?.[String(found.desa)] || found.desa;
        found.sumber = sumber;
        setDetailRecord(found);
      } else message.warning("Data detail tidak ditemukan");
    } catch {
      message.error("Gagal memuat detail data");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setDetailVisible(false);
    setDetailRecord(null);
  };

  const changeStatus = async (newStatus) => {
    try {
      if (!selectedRowKeys.length) {
        return message.warning("Pilih minimal satu data");
      }

      setProcessing(true);

      const selectedRecords = data.filter((r) =>
        selectedRowKeys.includes(r.id)
      );

      // Kelompokkan berdasarkan sumber
      const grouped = selectedRecords.reduce((acc, r) => {
        if (!acc[r.sumber]) acc[r.sumber] = [];
        acc[r.sumber].push(r.id);
        return acc;
      }, {});

      const payload = {
        data: Object.entries(grouped).map(([sumber, ids]) => ({
          sumber,
          ids,
          status: newStatus,
        })),
      };

      const res = await instance.patch("/verifikasi/update-status", payload);

      if (res.data?.isSuccess) {
        message.success(res.data.message || "Status berhasil diperbarui");
        setData((prev) =>
          prev.filter((r) => !selectedRecords.some((s) => s.id === r.id))
        );
        setSelectedRowKeys([]);
      } else {
        message.error(res.data?.message || "Gagal memperbarui status");
      }
    } catch (err) {
      console.error(err);
      message.error("Terjadi kesalahan saat memperbarui status");
    } finally {
      setProcessing(false);
    }
  };

  const columns = useMemo(
    () => [
      { title: "No.", key: "no", render: (_, __, index) => index + 1, width: 60 },
      { title: "Nama", dataIndex: "nama", key: "nama" },
      { title: "NIK", dataIndex: "nik", key: "nik" },
      { title: "Pengusul", dataIndex: "pengusul", key: "pengusul" },
      {
        title: "Sumber",
        dataIndex: "sumber",
        key: "sumber",
        render: (val) =>
          val === "pendataan" ? <Tag color="blue">Mahyani</Tag> : val === "zkup" ? <Tag color="red">ZKup</Tag> : "-",
      },
      {
        title: "Wilayah",
        key: "wilayah",
        render: (_, record) => {
          const { maps } = geoData;
          const des = maps?.villageMap?.[String(record.desa)] || record.desa;
          const kec = maps?.districtMap?.[String(record.kecamatan)] || record.kecamatan;
          const kab = maps?.regencyMap?.[String(record.kabupaten)] || record.kabupaten;
          return [des, kec, kab].filter(Boolean).join(", ");
        },
      },
      {
        title: "Tanggal",
        dataIndex: "tanggal",
        key: "tanggal",
        render: (val) => (val ? new Date(val).toLocaleDateString("id-ID") : "-"),
      },
      {
        title: "Aksi",
        key: "aksi",
        render: (_, record) => (
          <div className="flex gap-2">
            {/* <Button size="small" onClick={() => handleView(record)}>Lihat</Button> */}
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </div>
        ),
      },
    ],
    [processing, geoData]
  );

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div className="text-gray-600 py-10 lg:px-32 px-4 mb-10 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Verifikasi Data</h2>

      <div className="bg-white p-4 rounded-xl shadow">
        <div className="flex gap-3 mb-4">
          <Popconfirm
            title="Konfirmasi Persetujuan"
            description="Apakah kamu yakin ingin menyetujui data terpilih?"
            okText="Ya, Setujui"
            cancelText="Batal"
            onConfirm={() => changeStatus("Disetujui")}
          >
            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={processing}
              disabled={!selectedRowKeys.length || processing}
            >
              Setujui
            </Button>
          </Popconfirm>

          <Popconfirm
            title="Konfirmasi Penolakan"
            description="Apakah kamu yakin ingin menolak data terpilih?"
            okText="Ya, Tolak"
            cancelText="Batal"
            onConfirm={() => changeStatus("Ditolak")}
          >
            <Button
              danger
              icon={<CloseOutlined />}
              loading={processing}
              disabled={!selectedRowKeys.length || processing}
            >
              Tolak
            </Button>
          </Popconfirm>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Spin tip="Memuat data..." />
          </div>
        ) : (
          <Table
            dataSource={data}
            columns={columns}
            rowSelection={rowSelection}
            rowKey={(record) => record.id}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1100 }}
          />
        )}
      </div>

      <DetailModal
        visible={detailVisible}
        onClose={handleCloseDetail}
        record={detailRecord}
        loading={detailLoading}
      />
    </div>
  );
}

export default Verifikasi;
