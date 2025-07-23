/* eslint-disable react/prop-types */
import { Card, Row, Col, Tag, Grid } from 'antd';

const { useBreakpoint } = Grid;

const PendataanCard = ({ item, geoData }) => {
  const screens = useBreakpoint();
  // eslint-disable-next-line no-unused-vars
  const isMobile = !screens.md;

  const getNameById = (id, list) => list?.find((i) => i.id === id)?.name || '';

  return (
    <Card
      title={item.nama || 'N/A'}
      bordered={false}
      style={{
        marginBottom: 24,
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
      headStyle={{ backgroundColor: '#f5f5f5' }}
    >
      <Row gutter={[16, 12]}>
        <Col xs={24} md={12}>
          <p><strong>NIK:</strong> {item.nik}</p>
          <p><strong>Jumlah Keluarga:</strong> {item.jumlah_keluarga}</p>
          <p><strong>Telepon:</strong> {item.telepon}</p>
          <p>
            <strong>Alamat:</strong><br />
            {[getNameById(item.desa, geoData.villages), getNameById(item.kecamatan, geoData.districts), getNameById(item.kabupaten, geoData.regencies)]
              .filter(Boolean)
              .join(', ')}
          </p>
          <p><strong>Pengusul:</strong> {item.pengusul}</p>
        </Col>

        <Col xs={24} md={12}>
          <p><strong>Kondisi Rumah:</strong> <Tag color="orange">{item.kondisi_rumah}</Tag></p>
          <p><strong>Status Kepemilikan:</strong> <Tag color="blue">{item.status_kepemilikan}</Tag></p>
          <p><strong>Akses Air Bersih:</strong> <Tag color={item.akses_air_bersih === 'Ada' ? 'green' : 'red'}>{item.akses_air_bersih}</Tag></p>
          <p><strong>Ketersediaan MCK:</strong> <Tag color={item.ketersediaan_mck === 'Ada' ? 'green' : 'red'}>{item.ketersediaan_mck}</Tag></p>
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <strong>Foto Rumah:</strong>
        <Row gutter={[12, 12]} style={{ marginTop: 8 }}>
          <Col xs={24} sm={8}>
            <img src={item.foto_depan} alt="Depan" style={{ width: '100%', borderRadius: 8, objectFit: 'cover', height: 160 }} />
            <p style={{ textAlign: 'center', marginTop: 4 }}>Depan</p>
          </Col>
          <Col xs={24} sm={8}>
            <img src={item.foto_samping} alt="Samping" style={{ width: '100%', borderRadius: 8, objectFit: 'cover', height: 160 }} />
            <p style={{ textAlign: 'center', marginTop: 4 }}>Samping</p>
          </Col>
          <Col xs={24} sm={8}>
            <img src={item.foto_belakang} alt="Belakang" style={{ width: '100%', borderRadius: 8, objectFit: 'cover', height: 160 }} />
            <p style={{ textAlign: 'center', marginTop: 4 }}>Belakang</p>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default PendataanCard;
