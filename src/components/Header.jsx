import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Menu } from "antd"
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import { deauthUser } from "../utils/auth";

function Header() {
  const [current, setCurrent] = useState('mahyani');
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };
  const onClick = e => {
    setCurrent(e.key);
    if (e.key === 'mahyani') {
      navigate('/');
    } else {
      navigate(e.key);
    }
    setMenuVisible(false)
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
      disabled: false
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
    <div className="w-full right-0 lg:px-10 px-2 py-3 bg-white shadow">
      <div className="flex justify-between items-center">
        <div className="flex justify-center gap-4 items-center">
          <img className="lg:h-16 h-10" src="https://i.imgur.com/UTeZmP5.png" />
          <h3 className="text-gray-800 lg:text-xl font-semibold">SIGEDE MAHYANI</h3>
        </div>
        <Menu className="hidden lg:flex" onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
        <div className='lg:hidden text-2xl text-gray-600' onClick={toggleMenu}>
            {menuVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
        </div>
      </div>
      {menuVisible && (
        <div className='absolute flex flex-col gap-4 pr-3 font-medium text-red-600 items-center z-50 w-full bg-gray-200 shadow z-[9999]'>
          <Menu onClick={onClick} selectedKeys={[current]} mode="inline" items={items} />
        </div>
      )}
    </div>
  )
}

export default Header