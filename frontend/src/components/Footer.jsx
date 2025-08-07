import navLogo from '../assets/nav-logo.png';

function Footer() {

  return (
    <div className="flex flex-row justify-start text-white
    min-h-[12vh] max-h-[12vh] bg-gray-800 
    flex items-center justify-center p-4">
      <div className="flex flex-col items-center">
        <img
        src={navLogo}
        alt={`Tabs and Tutorials Logo`}
        className="min-w-[6vh] max-w-[6vh]"
        />
        <h1 className="text-sm text-white font-bold text-center">
            Tabs & Tutorials
        </h1>
      </div>
    </div>
  );
}

export default Footer;
