import logo from "../assets/Icon.png";

const Loading = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <img
        src={logo}
        alt="Ordura Logo"
        className="w-16 h-16 mb-4 animate-pulse"
      />
      <p className="text-gray-600 text-lg">Loading...</p>
    </div>
  );
};

export default Loading;
