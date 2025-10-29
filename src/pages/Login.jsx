import { Button, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { loginUser } from "../utils/auth"; // pastikan path benar

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔒 Redirect jika sudah login
  useEffect(() => {
    const token = localStorage.getItem("baznas_token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    const result = await loginUser(email, password);
    setLoading(false);

    if (result.success) {
      navigate("/"); // arahkan ke dashboard/home
    } else {
      console.log("Login gagal, silakan periksa kembali.");
    }
  };

  return (
    <section>
      <div className="lg:flex flex-col gap-20 justify-center items-center h-screen">
        <div className="flex justify-center gap-4 items-center">
          <img className="lg:h-20 h-10" src="https://i.imgur.com/UTeZmP5.png" />
          <h3 className="text-gray-800 lg:text-xl font-semibold">SIGEDE MAHYANI</h3>
        </div>
        <div className="lg:w-1/2 lg:py-0 py-10 flex items-center">
          <form
            className="w-full lg:px-28 px-4 items-center"
            onSubmit={handleLogin}
          >
            <h2 className="font-bold text-[18px] lg:text-4xl mb-10 text-gray-900 uppercase">
              Login
            </h2>

            <Input
              type="email"
              placeholder="Email"
              size="large"
              className="mb-4 border"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              size="large"
              className="mb-8 border"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              required
            />

            <Button
              htmlType="submit"
              size="large"
              className="bg-green-600 w-full text-white"
              loading={loading}
            >
              {loading ? "Memproses..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Login;
