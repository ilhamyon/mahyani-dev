import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  // ReloadOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { instance } from "../utils/auth";

const { Option } = Select;

function ManajemenUser() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // 🚀 Fetch data user
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await instance.get("/users");
      setData(res.data?.data || []);
    } catch (err) {
      message.error("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🧱 Tambah / Edit / Ubah Password User
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingUser) {
        // Jika admin isi password baru, sertakan di update
        const payload = { ...values };
        if (!values.password) delete payload.password;

        await instance.put(`/users/${editingUser.id}`, payload);
        message.success("User berhasil diperbarui");
      } else {
        // Create baru
        await instance.post("/users", values);
        message.success("User berhasil ditambahkan");
      }

      setOpenModal(false);
      setEditingUser(null);
      form.resetFields();
      fetchUsers();
    } catch (err) {
      message.error("Gagal menyimpan data user");
    }
  };

  // 🗑️ Hapus User
  const handleDelete = async (id) => {
    try {
      await instance.delete(`/users/${id}`);
      message.success("User berhasil dihapus");
      fetchUsers();
    } catch (err) {
      message.error("Gagal menghapus user");
    }
  };

  const columns = [
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Pengusul",
      dataIndex: "pengusul",
      key: "pengusul",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <span
          className={`px-2 py-1 rounded-md text-xs font-medium ${
            role === "admin"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {role}
        </span>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingUser(record);
              setOpenModal(true);
              form.setFieldsValue(record);
            }}
          />

          <Popconfirm
            title="Hapus user ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Batal"
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <section
        id="input-lokasi"
        className="text-gray-600 py-10 lg:px-32 px-4 mb-10 bg-gray-100"
      >
        <h2 className="font-semibold text-2xl text-gray-700 mb-6">
          Manajemen User
        </h2>

        <div className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Daftar User</h2>
            <div className="flex gap-2">
              {/* <Button
                icon={<ReloadOutlined />}
                onClick={fetchUsers}
                loading={loading}
              >
                Refresh
              </Button> */}
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingUser(null);
                  setOpenModal(true);
                  form.resetFields();
                }}
              >
                Tambah User
              </Button>
            </div>
          </div>

          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={data}
          />

          {/* Modal Tambah/Edit */}
          <Modal
            open={openModal}
            title={editingUser ? "Edit User" : "Tambah User"}
            okText="Simpan"
            cancelText="Batal"
            onCancel={() => {
              setOpenModal(false);
              setEditingUser(null);
            }}
            onOk={handleSubmit}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="name"
                label="Nama"
                rules={[{ required: true, message: "Nama wajib diisi" }]}
              >
                <Input placeholder="Nama lengkap" />
              </Form.Item>

              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: "Username wajib diisi" }]}
              >
                <Input placeholder="Username" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: "Email wajib diisi" }]}
              >
                <Input placeholder="Email user" />
              </Form.Item>

              <Form.Item
                name="password"
                label={
                  editingUser ? (
                    <span>
                      Password Baru <span className="text-gray-400">(opsional)</span>
                    </span>
                  ) : (
                    "Password"
                  )
                }
                rules={
                  editingUser
                    ? []
                    : [{ required: true, message: "Password wajib diisi" }]
                }
              >
                <Input.Password
                  placeholder={
                    editingUser
                      ? "Isi jika ingin mengubah password"
                      : "Password"
                  }
                  prefix={<LockOutlined />}
                />
              </Form.Item>

              <Form.Item
                name="pengusul"
                label="Pengusul"
                rules={[{ required: true, message: "Pengusul wajib diisi" }]}
              >
                <Select placeholder="Pilih pengusul">
                  <Option value="BAZNAS Prov NTB">BAZNAS Prov NTB</Option>
                  <Option value="BAZNAS Mataram">BAZNAS Mataram</Option>
                  <Option value="BAZNAS Lombok Barat">BAZNAS Lombok Barat</Option>
                  <Option value="BAZNAS Lombok Utara">BAZNAS Lombok Utara</Option>
                  <Option value="BAZNAS Lombok Tengah">BAZNAS Lombok Tengah</Option>
                  <Option value="BAZNAS Lombok Timur">BAZNAS Lombok Timur</Option>
                  <Option value="BAZNAS Sumbawa">BAZNAS Sumbawa</Option>
                  <Option value="BAZNAS Sumbawa Barat">BAZNAS Sumbawa Barat</Option>
                  <Option value="BAZNAS Dompu">BAZNAS Dompu</Option>
                  <Option value="BAZNAS Bima">BAZNAS Bima</Option>
                  <Option value="BAZNAS Kota Bima">BAZNAS Kota Bima</Option>
                  <Option value="Lainnya">Lainnya</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "Pilih role user" }]}
              >
                <Select placeholder="Pilih role">
                  <Option value="admin">Admin</Option>
                  <Option value="user">User</Option>
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </section>
    </>
  );
}

export default ManajemenUser;
