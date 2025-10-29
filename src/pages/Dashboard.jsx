/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { instance } from "../utils/auth";
import axios from "axios";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Statistic, Spin } from "antd";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dataSummary, setDataSummary] = useState({});
  const [dataPerKabupaten, setDataPerKabupaten] = useState([]);
  const [dataPerTahun, setDataPerTahun] = useState([]);
  const [dataPerPengusul, setDataPerPengusul] = useState([]);
  const [dataPerStatus, setDataPerStatus] = useState([]);
  const [kabupatenList, setKabupatenList] = useState([]);
  const totalStatus = dataPerStatus.map((s) => ({
    status: s.status,
    total: (s.pendataan || 0) + (s.zkup || 0),
  }));

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Ambil semua data dari backend secara paralel
        const [summaryRes, kabupatenRes, tahunRes, pengusulRes, statusRes] = await Promise.all([
          instance.get("/grafik/summary"),
          instance.get("/grafik/perKabupaten"),
          instance.get("/grafik/perTahun"),
          instance.get("/grafik/perPengusul"),
          instance.get("/grafik/perStatus"),
        ]);

        const summary = summaryRes.data?.data || {};
        const perKabupaten = Array.isArray(kabupatenRes.data?.data)
          ? kabupatenRes.data.data
          : [];
        const perTahun = Array.isArray(tahunRes.data?.data) ? tahunRes.data.data : [];
        const perPengusul = Array.isArray(pengusulRes.data?.data)
          ? pengusulRes.data.data
          : [];
        const perStatus = Array.isArray(statusRes.data?.data) ? statusRes.data.data : [];

        // Ambil daftar kabupaten NTB (kode 52)
        const regenciesRes = await axios.get(
          "https://www.emsifa.com/api-wilayah-indonesia/api/regencies/52.json"
        );
        const regencies = regenciesRes.data || [];

        // Gabungkan nama kabupaten
        const mergedKabupaten = perKabupaten.map((item) => {
          const match = regencies.find((r) => r.id === item.kabupaten);
          return {
            ...item,
            namaKabupaten: match ? match.name : `Kode ${item.kabupaten}`,
          };
        });

        setDataSummary(summary);
        setDataPerKabupaten(mergedKabupaten);
        setDataPerTahun(perTahun);
        setDataPerPengusul(perPengusul);
        setKabupatenList(regencies);
        setDataPerStatus(perStatus);
      } catch (err) {
        console.error("Gagal memuat data dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // ===== Chart: Per Kabupaten =====
  const barKabupatenData = {
    labels: dataPerKabupaten.map((k) => k.namaKabupaten),
    datasets: [
      {
        label: "Mahyani",
        data: dataPerKabupaten.map((k) => k.pendataan),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "ZKUP",
        data: dataPerKabupaten.map((k) => k.zkup),
        backgroundColor: "rgba(255, 159, 64, 0.6)",
      },
    ],
  };

  // ===== Chart: Per Tahun =====
  const barTahunData = {
    labels: dataPerTahun.map((t) => t.tahun),
    datasets: [
      {
        label: "Mahyani",
        data: dataPerTahun.map((t) => t.pendataan),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
      {
        label: "ZKUP",
        data: dataPerTahun.map((t) => t.zkup),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="Memuat data dashboard..." />
      </div>
    );
  }

  return (
    <div className="text-gray-600 py-10 lg:px-32 px-4 mb-10 bg-gray-100 min-h-screen">
      <h2 className="font-semibold text-2xl text-gray-700 mb-6">Dashboard</h2>

      {/* === Summary Cards === */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white rounded-xl shadow">
          <Statistic title="Menunggu Verifikasi" value={totalStatus[0]?.total || 0} />
        </div>
        <div className="p-4 bg-white rounded-xl shadow">
          <Statistic title="Mahyani" value={dataSummary.pendataan || 0} />
        </div>
        <div className="p-4 bg-white rounded-xl shadow">
          <Statistic title="ZKUP" value={dataSummary.zkup || 0} />
        </div>
        {/* <div className="p-4 bg-white rounded-xl shadow">
          <Statistic title="Total" value={dataSummary.total || 0} />
        </div> */}
      </div>

      {/* === Grafik Per Tahun & Per Pengusul === */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Grafik Per Tahun */}
          <div className="h-96 flex flex-col">
            <h4 className="text-base font-medium mb-3 text-gray-600">
              Distribusi Data per Tahun
            </h4>
            <div className="flex-grow">
              <Bar data={barTahunData} options={chartOptions} />
            </div>
          </div>

          {/* Grafik Per Pengusul */}
          <div className="h-96 flex flex-col">
            <h4 className="text-base font-medium mb-3 text-gray-600">
              Distribusi Data per Pengusul
            </h4>
            <div className="flex-grow">
              <Bar
                data={{
                  labels: dataPerPengusul.map((p) => p.pengusul),
                  datasets: [
                    {
                      label: "Mahyani",
                      data: dataPerPengusul.map((p) => p.pendataan),
                      backgroundColor: "rgba(54, 162, 235, 0.6)",
                    },
                    {
                      label: "ZKUP",
                      data: dataPerPengusul.map((p) => p.zkup),
                      backgroundColor: "rgba(255, 99, 132, 0.6)",
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>
        </div>
      </div>

      {/* === Grafik Per Kabupaten === */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h3 className="font-semibold mb-4 text-gray-700">
          Distribusi Data per Kabupaten/Kota
        </h3>
        <div>
          <Bar data={barKabupatenData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
