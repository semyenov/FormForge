import { Fragment, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Dialog, DialogPanel, Menu, MenuItem, MenuItems, MenuButton, Transition, TransitionChild } from "@headlessui/react";
import { Menu as MenuIcon, FileSpreadsheet, House, Layers, Settings, User, X, Building2, Clock, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: House },
  { name: "Forms", href: "/forms", icon: FileSpreadsheet },
  { name: "Templates", href: "/templates", icon: FileText },
  { name: "Reviews", href: "/reviews", icon: Clock },
  { name: "Organizations", href: "/organizations", icon: Building2 },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // me();

  const handleLogout = async () => {
    if (user) {
      await logout();
      navigate("/login");
    }
  };

  return (
    <div className="h-full min-h-screen bg-gray-50">
      <Transition show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <TransitionChild as={Fragment} enter="transition-opacity ease-linear duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="transition-opacity ease-linear duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-gray-900/80" />
          </TransitionChild>
          <div className="flex fixed inset-0">
            <TransitionChild as={Fragment} enter="transition ease-in-out duration-300 transform" enterFrom="-translate-x-full" enterTo="translate-x-0" leave="transition ease-in-out duration-300 transform" leaveFrom="translate-x-0" leaveTo="-translate-x-full">
              <DialogPanel className="flex relative flex-1 mr-16 w-full max-w-xs">
                <TransitionChild as={Fragment} enter="ease-in-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in-out duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <div className="flex absolute top-0 left-full justify-center pt-5 w-16">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                      <span className="sr-only">Close sidebar</span>
                      <X className="w-6 h-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </TransitionChild>

                <div className="flex overflow-y-auto flex-col gap-y-5 px-6 pb-2 bg-white grow">
                  <div className="flex items-center h-16 shrink-0">
                    <Layers className="w-auto h-8 text-blue-600" />
                    <span className="ml-2 text-xl font-semibold">FormForge</span>
                  </div>
                  <nav className="flex flex-col flex-1">
                    <ul role="list" className="flex flex-col flex-1 gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <NavLink to={item.href} className={({ isActive }) => classNames(isActive ? "bg-gray-50 text-blue-600" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50", "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold")}>
                                {({ isActive }) => (
                                  <>
                                    <item.icon className={classNames(isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600", "w-6 h-6 shrink-0")} aria-hidden="true" />
                                    {item.name}
                                  </>
                                )}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex overflow-y-auto flex-col gap-y-5 px-6 bg-white border-r border-gray-200 grow">
          <div className="flex items-center h-16 shrink-0">
            <Layers className="w-auto h-8 text-blue-600" />
            <span className="ml-2 text-xl font-semibold">FormForge</span>
          </div>
          <nav className="flex flex-col flex-1">
            <ul role="list" className="flex flex-col flex-1 gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <NavLink to={item.href} className={({ isActive }) => classNames(isActive ? "bg-gray-50 text-blue-600" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50", "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold")}>
                        {({ isActive }) => (
                          <>
                            <item.icon className={classNames(isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600", "w-6 h-6 shrink-0")} aria-hidden="true" />
                            {item.name}
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <a href="#" className="flex gap-x-3 p-2 -mx-2 text-sm font-semibold leading-6 text-gray-700 rounded-md group hover:bg-gray-50 hover:text-blue-600">
                  <Settings className="w-6 h-6 text-gray-400 shrink-0 group-hover:text-blue-600" aria-hidden="true" />
                  Settings
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="flex sticky top-0 z-40 gap-x-6 items-center px-4 py-4 bg-white shadow-sm sm:px-6 lg:hidden">
        <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
          <span className="sr-only">Open sidebar</span>
          <MenuIcon className="w-6 h-6" aria-hidden="true" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">Dashboard</div>
        <Menu as="div" className="relative">
          <MenuButton className="-m-1.5 flex items-center p-1.5">
            <span className="sr-only">Open user menu</span>
            <User className="p-1 w-8 h-8 bg-gray-50 rounded-full" aria-hidden="true" />
          </MenuButton>
          <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
            <MenuItems className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
              <MenuItem>
                {({ focus }) => (
                  <button onClick={handleLogout} className={classNames(focus ? "bg-gray-50" : "", "block px-3 py-1 w-full text-sm leading-6 text-left text-gray-900")}>
                    Sign out
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Transition>
        </Menu>
      </div>

      <main className="py-10 lg:pl-72">
        <div className="px-4 sm:px-6 lg:px-8">
          <Outlet />
          {user && (
            <>
              {JSON.stringify(user)}
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
