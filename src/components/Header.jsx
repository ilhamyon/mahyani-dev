import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Dropdown, Menu } from "antd"
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { deauthUser } from "../utils/auth";
// import { deauthUser } from "../utils/auth";

function Header() {
  const [current, setCurrent] = useState('mahyani');
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [menuVisible, setMenuVisible] = useState(false);
  const userData = JSON.parse(localStorage.getItem('baznas_userData'));
  const typeUser = localStorage.getItem('baznas_typeUser');
  // console.log("typeUser", typeUser);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };
  const onClick = e => {
    setCurrent(e.key);
    if (e.key === 'dashboard') {
      navigate('/');
    } else {
      navigate(e.key);
    }
    setMenuVisible(false)
  };
  useEffect(() => {
    if (path === "/") {
      setCurrent("dashboard");
    } else if (path === "/mahyani") {
      setCurrent("mahyani");
    } else if (path === "/peta-sebaran") {
      setCurrent("peta-sebaran");
    } else if (path === "/zkup") {
      setCurrent("zkup");
    } else if (path === "/jamban") {
      setCurrent("jamban");
    } else if (path === "/verifikasi") {
      setCurrent("verifikasi");
    } else if (path === "/manajemen-user") {
      setCurrent("manajemen-user");
    }
  }, [path]);
  const items = [
    {
      label: 'Dashboard',
      key: 'dashboard',
    },
    ...(typeUser === "admin"
    ? [
        {
          label: "Verifikasi",
          key: "verifikasi",
        },
      ]
    : []),
    {
      label: 'Mahyani',
      key: 'mahyani',
    },
    {
      label: 'ZKup',
      key: 'zkup',
      disabled: false
    },
    // {
    //   label: 'Jamban',
    //   key: 'jamban',
    //   disabled: true
    // },
    {
      label: 'Peta Sebaran',
      key: 'peta-sebaran',
    },
  ];
  const menu = (
    <Menu>
      {typeUser === "admin" && (
        <>
          {/* <Menu.Item key="rekap">
            <Link to="/rekap">Rekap</Link>
          </Menu.Item> */}
          <Menu.Item key="manajemen-user">
            <Link to="/manajemen-user">Manajemen User</Link>
          </Menu.Item>
        </>
      )}
      <Menu.Item key="signout" onClick={deauthUser}>Logout</Menu.Item>
    </Menu>
  );
  return (
    <div className="w-full right-0 lg:px-10 px-2 py-3 bg-white shadow">
      <div className="flex justify-between items-center">
        <div className="flex justify-center gap-4 items-center">
          <img className="lg:h-16 h-10" src="https://i.imgur.com/UTeZmP5.png" />
          <h3 className="text-gray-800 lg:text-xl font-semibold">SIGEDE MAHYANI</h3>
        </div>
        <Menu className="hidden lg:flex mr-44 w-1/3 justify-end" onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
        <div className='lg:hidden text-2xl text-gray-600' onClick={toggleMenu}>
            {menuVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
        </div>
        <div className="absolute lg:right-0 right-8 p-6 cursor-pointer flex items-center gap-3">
          <Dropdown overlay={menu} placement="bottomRight" arrow trigger={['click']}>
            <div className="flex items-center gap-3 border rounded-xl p-2 hover:shadow">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex justify-center items-center">
                <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="12" r="8" fill="#333" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><path d="M42 44C42 34.0589 33.9411 26 24 26C14.0589 26 6 34.0589 6 44" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex items-center gap-2 hidden lg:flex">
                <span className="text-gray-800 text-xs">{userData?.name}</span>
              </div>
            </div>
          </Dropdown>
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