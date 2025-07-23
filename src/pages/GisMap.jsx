import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// eslint-disable-next-line no-unused-vars
import { sanityClient } from "../lib/sanity/getClient";
import iconBerugak from "/icon-berugak.png"
import axios from "axios";
import PendataanCard from "../components/PendataanCard";

const GISMap = () => {
  const [data, setData] = useState([]);
  const [geoData, setGeoData] = useState({
    provinces: [],
    regencies: [],
    districts: [],
    villages: [],
  });
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ambil data dari API kamu
        const { data: response } = await axios.get("https://mahyani.amayor.id/api/pendataan");
        const result = response.data; // Ambil data dari struktur { data, errorMessage, isSuccess }

        setData(result);

        // 2. Ambil daftar ID unik untuk setiap wilayah
        const provinceIds = ['52']; // ID untuk NTB
        const regencyIds = [...new Set(result.map((item) => item.kabupaten))];
        const districtIds = [...new Set(result.map((item) => item.kecamatan))];
        // eslint-disable-next-line no-unused-vars
        const villageIds = [...new Set(result.map((item) => item.desa))];

        // 3. Fetch data wilayah dari EMSIFA
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
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Fungsi untuk mencari nama wilayah berdasarkan ID
  // const getNameById = (id, list) => {
  //   if (!list) return "Not Found";
  //   const item = list.find((item) => String(item.id) === String(id));
  //   return item ? item.name : "Not Found";
  // };

  // const content = (
  //   <div>
  //     <p>Aplikasi ini menggambarkan titik lokasi</p>
  //   </div>
  // );

  useEffect(() => {
    const handleResize = () => {
      mapRef.current?.invalidateSize();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);  

  // Contoh koordinat polygon untuk Desa Sekaroh (bisa diganti dengan data resmi)
  // const sekarohCoords = [
  //   [-8.788900 , 116.479800],
  //   [-8.790300 , 116.481000],
  //   [-8.781500 , 116.485200],
  //   [-8.803500 , 116.485000],
  //   [-8.809900 , 116.495100],
  //   [-8.806400 , 116.493200],
  //   [-8.804900 , 116.471900],
  //   [-8.804600 , 116.474900],
  //   [-8.799300 , 116.502600],
  //   [-8.802700 , 116.500200],
  //   [-8.787100 , 116.496000],
  // ];

  // const pandanWangiCoords = [
  //   [-8.784700 , 116.450500],
  //   [-8.788600 , 116.464400],
  //   [-8.793300 , 116.469400],
  //   [-8.810300 , 116.446800],
  //   [-8.817200 , 116.450300],
  //   [-8.799600 , 116.461000],
  //   [-8.803100 , 116.450100],
  //   [-8.812600 , 116.442500],
  //   [-8.788800 , 116.448300],
  // ]

  return (
    <>
    <MapContainer
      center={[-8.686231, 116.106701]}
      zoom={13}
      style={{ height: "calc(100vh - 64px)", width: "100%" }}
      ref={mapRef}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <FitBounds data={data} />
      {data.map((item) => (
        <Marker
          key={item.id}
          position={[item?.latitude || 0, item?.longitude || 0]}
          icon={L.icon({
            iconUrl: iconBerugak,
            iconSize: [30, 30],
            iconAnchor: [12, 41],
          })}
        >
          <Popup>
            <PendataanCard key={item.id} item={item} geoData={geoData} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
    </>
  );
};

// Komponen untuk otomatis menyesuaikan tampilan peta dengan data yang tersedia
// eslint-disable-next-line react/prop-types
const FitBounds = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    // eslint-disable-next-line react/prop-types
    if (data.length > 0) {
      // eslint-disable-next-line react/prop-types
      const bounds = L.latLngBounds(data.map((item) => [item?.latitude || 0, item?.longitude || 0]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [data, map]);

  return null;
};

export default GISMap;
