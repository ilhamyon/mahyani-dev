/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconBerugak from "/icon-berugak.png";
import axios from "axios";
import PendataanCard from "../components/PendataanCard";
import ZKupCard from "../components/ZKupCard";
import { Select } from "antd";

const { Option } = Select;

const GISMap = () => {
  const [data, setData] = useState([]);
  const [geoData, setGeoData] = useState({
    provinces: [],
    regencies: [],
    districts: [],
    villages: [],
  });
  const [source, setSource] = useState("pendataan");
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = source === "pendataan" ? "pendataan" : "zkup";
        const { data: response } = await axios.get(`https://mahyani.amayor.id/api/${endpoint}`);
        const result = response.data;

        setData(result);

        const provinceIds = ['52'];
        const regencyIds = [...new Set(result.map((item) => item.kabupaten))];
        const districtIds = [...new Set(result.map((item) => item.kecamatan))];
        const villageIds = [...new Set(result.map((item) => item.desa))];

        const [provinces, regencies, districts, villages] = await Promise.all([
          axios.get("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json").then((res) => res.data),
          Promise.all(
            provinceIds.map((id) =>
              axios.get(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${id}.json`).then((res) => res.data)
            )
          ).then((data) => data.flat()),
          Promise.all(
            regencyIds.map((id) =>
              axios.get(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${id}.json`).then((res) => res.data)
            )
          ).then((data) => data.flat()),
          Promise.all(
            districtIds.map((id) =>
              axios.get(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${id}.json`).then((res) => res.data)
            )
          ).then((data) => data.flat()),
        ]);

        setGeoData({ provinces, regencies, districts, villages });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [source]);

  useEffect(() => {
    const handleResize = () => {
      mapRef.current?.invalidateSize();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className="p-2 bg-white shadow z-[999] absolute lg:top-28 top-20 right-3 rounded -mt-3">
        <label className="mr-2 text-sm text-gray-600">Sumber Data:</label>
        <Select
          value={source}
          onChange={(value) => setSource(value)}
          size="large"
          className="w-full mt-1"
        >
          <Option value="pendataan">Mahyani</Option>
          <Option value="zkup">ZKUP</Option>
        </Select>
      </div>

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
              {source === "pendataan" ? (
                <PendataanCard key={item.id} item={item} geoData={geoData} />
              ) : (
                <ZKupCard key={item.id} item={item} geoData={geoData} />
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
};

const FitBounds = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    if (data.length > 0) {
      const bounds = L.latLngBounds(data.map((item) => [item?.latitude || 0, item?.longitude || 0]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [data, map]);

  return null;
};

export default GISMap;
