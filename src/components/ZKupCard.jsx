/* eslint-disable react/prop-types */
import { Card, Row, Col, Grid, Image } from 'antd';

const { useBreakpoint } = Grid;

const ZKupCard = ({ item, geoData }) => {
  const screens = useBreakpoint();
  // eslint-disable-next-line no-unused-vars
  const isMobile = !screens.md;

  const getNameById = (id, list) => list?.find((i) => i.id === id)?.name || '';

  return (
    <Card
      title={item.nama || 'N/A'}
      bordered={false}
      style={{
        marginBottom: 20,
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
          <p><strong>Jenis Usaha:</strong> {item.jenis_usaha}</p>
          <p><strong>Lokasi Usaha:</strong> {item.lokasi_usaha}</p>
          <p><strong>Periode:</strong> {item.periode}</p>
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <strong>Foto Usaha:</strong>
        <Row gutter={[12, 12]} style={{ marginTop: 8 }}>
          <Col xs={24} sm={8}>
            <Image src={item.foto_usaha} alt="Depan" style={{ width: '100%', borderRadius: 8, objectFit: 'cover', height: 100 }} />
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default ZKupCard;
