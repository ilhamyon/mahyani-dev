/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { Card, Row, Col, Tag, Grid, Image, Collapse } from 'antd';

const { useBreakpoint } = Grid;
const { Panel } = Collapse;

const PendataanCard = ({ item, geoData }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const getNameById = (id, list) => list?.find((i) => i.id === id)?.name || '';

  const renderProgressSection = (progress) => {
    const labels = ['depan', 'samping', 'belakang'];
    const validPhotos = labels.filter(
      (label) => item[`foto_progres_${progress}_${label}`]
    );

    if (validPhotos.length === 0) return null;

    return (
      <div style={{ marginBottom: 16 }}>
        <strong>Progress {progress}%:</strong>
        <Row gutter={[12, 12]} style={{ marginTop: 8 }}>
          {validPhotos.map((label) => {
            const key = `foto_progres_${progress}_${label}`;
            const labelTitle = label.charAt(0).toUpperCase() + label.slice(1);
            return (
              <Col xs={24} sm={8} key={`${progress}-${label}`}>
                <Image
                  src={item[key]}
                  alt={`${labelTitle} ${progress}%`}
                  style={{ width: '100%', borderRadius: 8, objectFit: 'cover', height: 100 }}
                />
                <p style={{ textAlign: 'center', marginTop: 4 }}>{labelTitle}</p>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  };

  const hasAnyProgressPhoto =
    ['0', '50', '100'].some(progress =>
      ['depan', 'samping', 'belakang'].some(
        label => item[`foto_progres_${progress}_${label}`]
      )
    );

  const hasAnyFotoRumah =
    item.foto_depan || item.foto_samping || item.foto_belakang;

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
          <p><strong>Tahun Realisasi:</strong> {item.tahun_realisasi || '-'}</p>
        </Col>
      </Row>

      {(hasAnyFotoRumah || hasAnyProgressPhoto) && (
        <Collapse ghost style={{ marginTop: 24 }}>
          {hasAnyFotoRumah && (
            <Panel header="Lihat Foto Rumah" key="foto-rumah">
              <Row gutter={[12, 12]} style={{ marginTop: 8 }}>
                {item.foto_depan && (
                  <Col xs={24} sm={8}>
                    <Image src={item.foto_depan} alt="Depan" style={{ width: '100%', borderRadius: 8, objectFit: 'cover', height: 100 }} />
                    <p style={{ textAlign: 'center', marginTop: 4 }}>Depan</p>
                  </Col>
                )}
                {item.foto_samping && (
                  <Col xs={24} sm={8}>
                    <Image src={item.foto_samping} alt="Samping" style={{ width: '100%', borderRadius: 8, objectFit: 'cover', height: 100 }} />
                    <p style={{ textAlign: 'center', marginTop: 4 }}>Samping</p>
                  </Col>
                )}
                {item.foto_belakang && (
                  <Col xs={24} sm={8}>
                    <Image src={item.foto_belakang} alt="Belakang" style={{ width: '100%', borderRadius: 8, objectFit: 'cover', height: 100 }} />
                    <p style={{ textAlign: 'center', marginTop: 4 }}>Belakang</p>
                  </Col>
                )}
              </Row>
            </Panel>
          )}

          {hasAnyProgressPhoto && (
            <Panel header="Lihat Foto Progress Pembangunan" key="foto-progress">
              {renderProgressSection('0')}
              {renderProgressSection('50')}
              {renderProgressSection('100')}
            </Panel>
          )}
        </Collapse>
      )}
    </Card>
  );
};

export default PendataanCard;
