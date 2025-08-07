import navLogo from '../assets/nav-logo.png';

function AppNavbar() {

  return (
    <div className="flex flex-row justify-center text-white bg-transparent min-height-[10vh] max-height-[10vh]">
        <img
        src={navLogo}
        alt={`Tabs and Tutorials Logo`}
        className="min-w-[10vh] max-w-[10vh]"
        />
    </div>
  );
}

export default AppNavbar;
