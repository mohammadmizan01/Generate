
const Footer = () => {
  return (
    <footer className="bg-[#131314] w-full max-w-1350px mx-auto text-white pt-8 lg:pt-12 px-4 sm:px-8 md:px-16 lg:px-28 rounded-tl-3xl rounded-tr-3xl overflow-hidden">
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-6 gap-8 md:gap-12">
        
        {/* Left Section */}
        <div className="lg:col-span-3 space-y-6">
          <a href="https://prebuiltui.com" className="block">
            {/* SVG Logo */}
            <svg width="157" height="40" viewBox="0 0 157 40" fill="none">
              <path d="m8.75 11.3 6.75 3.884 6.75-3.885M8.75 34.58v-7.755L2 22.939m27 0-6.75 3.885v7.754M2.405 15.408 15.5 22.954l13.095-7.546M15.5 38V22.939M29 28.915V16.962a2.98 2.98 0 0 0-1.5-2.585L17 8.4a3.01 3.01 0 0 0-3 0L3.5 14.377A3 3 0 0 0 2 16.962v11.953A2.98 2.98 0 0 0 3.5 31.5L14 37.477a3.01 3.01 0 0 0 3 0L27.5 31.5a3 3 0 0 0 1.5-2.585" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          <p className="text-sm/6 text-neutral-300 max-w-96">
            PrebuiltUI helps you build faster by transforming your design vision
            into fully functional, production-ready UI components.
          </p>

          {/* Social Icons */}
          <div className="flex gap-5 md:gap-6">
            <a href="#" className="hover:text-gray-300">X</a>
            <a href="#" className="hover:text-gray-300">GitHub</a>
            <a href="#" className="hover:text-gray-300">LinkedIn</a>
            <a href="#" className="hover:text-gray-300">YouTube</a>
            <a href="#" className="hover:text-gray-300">Instagram</a>
          </div>
        </div>

        {/* Right Section */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 lg:gap-28">
          
          <div>
            <h3 className="font-medium text-sm mb-4">Products</h3>
            <ul className="space-y-3 text-sm text-neutral-300">
              <li><a href="#" className="hover:text-neutral-400">Components</a></li>
              <li><a href="#" className="hover:text-neutral-400">Templates</a></li>
              <li><a href="#" className="hover:text-neutral-400">Icons</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-neutral-300">
              <li><a href="#" className="hover:text-neutral-400">PrebuiltUI</a></li>
              <li><a href="#" className="hover:text-neutral-400">Templates</a></li>
              <li><a href="#" className="hover:text-neutral-400">Components</a></li>
              <li><a href="#" className="hover:text-neutral-400">Blogs</a></li>
              <li><a href="#" className="hover:text-neutral-400">Store</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-neutral-300">
              <li><a href="#" className="hover:text-neutral-400">About</a></li>
              <li><a href="#" className="hover:text-neutral-400">Vision</a></li>
              <li className="flex items-center gap-2">
                <a href="#" className="hover:text-neutral-400">Careers</a>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-950 border border-green-300 text-green-300">
                  HIRING
                </span>
              </li>
              <li><a href="#" className="hover:text-neutral-400">Privacy policy</a></li>
              <li><a href="#" className="hover:text-neutral-400">Contact Us</a></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom */}
      <div className="max-w-7xl mx-auto mt-12 pt-4 border-t border-neutral-700 flex justify-between items-center">
        {/* <p className="text-neutral-400 text-sm">© 2026 PrebuiltUI Design</p>
        <p className="text-sm text-neutral-400">All right reserved.</p> */}
      </div>

      {/* Glow Text */}
      <div className="relative">
        <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-3xl h-full max-h-64 bg-green-500 rounded-full blur-[170px]" />
        <h3 className="text-center font-extrabold leading-[0.7] text-transparent text-[clamp(3rem,15vw,15rem)] [-webkit-text-stroke:1px_#0D542B] mt-6">
          Generator
        </h3>
      </div>

    </footer>
  );
};

export default Footer;