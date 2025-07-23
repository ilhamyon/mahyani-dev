import { Menu } from "antd"
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import { deauthUser } from "../utils/auth";

function Header() {
  const [current, setCurrent] = useState('mahyani');
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const onClick = e => {
    setCurrent(e.key);
    if (e.key === 'mahyani') {
      navigate('/');
    } else {
      navigate(e.key);
    }
  };
  useEffect(() => {
    if (path === "/") {
      setCurrent("mahyani");
    } else if (path === "/peta-sebaran") {
      setCurrent("peta-sebaran");
    } else if (path === "/zkup") {
      setCurrent("zkup");
    } else if (path === "/jamban") {
      setCurrent("jamban");
    }
  }, [path]);
  const items = [
    {
      label: 'Mahyani',
      key: 'mahyani',
    },
    {
      label: 'ZKup',
      key: 'zkup',
      disabled: true
    },
    {
      label: 'Jamban',
      key: 'jamban',
      disabled: true
    },
    {
      label: 'Peta Sebaran',
      key: 'peta-sebaran',
    },
  ];
  return (
    <div className="w-full right-0 px-10 py-3 bg-white shadow">
      <div className="flex lg:justify-between justify-center items-center">
        <div className="flex justify-center gap-4 items-center">
          <img className="h-16" src="https://i.imgur.com/UTeZmP5.png" />
          <h3 className="text-gray-800 lg:text-xl font-semibold">Pendataan Rumah Layak Huni</h3>
        </div>
        <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
      </div>
    </div>
  )
}

export default Header