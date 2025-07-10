import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ children, isPOSPage }) {
  return (
    <div className="flex h-screen">
      {!isPOSPage && <Sidebar />}
      <div className="flex flex-col flex-1">
        {!isPOSPage && <Topbar />}
        <main className="p-4 overflow-y-auto bg-gray-50 flex-1">{children}</main>
        <footer className="bg-gray-800 text-white text-center p-2">
          All right reserved to JC&TC © 2025 | Dev by Lt Cdr Atik. Made with ❤️
        </footer>
      </div>
    </div>
  );
}
