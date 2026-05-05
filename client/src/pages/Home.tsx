import NavBar from "../components/NavBar";


const Home = () => {
  return (
    <section className="relative flex flex-col items-center text-center text-white min-h-screen overflow-hidden">

      {/* NAVBAR */}
      <div className="relative z-50 w-full">
        <NavBar />
      </div>

      {/* BACKGROUND LAYERS */}
      <div className="absolute inset-0 bg-black" />

      <div className="absolute inset-0 bg-[url('https://assets.prebuiltui.com/images/components/hero-section/hero-galaxy-bg.png')] bg-cover bg-center bg-no-repeat opacity-70" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />

      {/* HERO CONTENT */}
      <div className="relative z-10 flex flex-col items-center mt-28 px-4 max-w-4xl">

        <div className="px-4 py-1 text-xs border border-white/20 rounded-full text-slate-300 mb-6 backdrop-blur">
          ✨ AI-powered presentation builder
        </div>

        <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
          Turn ideas into{" "}
          <span className="text-indigo-400">stunning slides</span> instantly
        </h1>

        <p className="mt-5 text-slate-300 max-w-xl text-base md:text-lg">
          Describe your idea and let AI generate beautiful, structured presentations in seconds.
        </p>

        <form className="mt-10 w-full max-w-2xl bg-white/5 border border-indigo-500/30 rounded-xl p-4 backdrop-blur">
          <textarea
            rows={4}
            placeholder="e.g. Create a pitch deck for a SaaS startup..."
            className="w-full bg-transparent outline-none resize-none text-sm text-slate-200 placeholder:text-slate-500"
          />

          <button
            type="submit"
            className="mt-3 w-full md:w-auto ml-auto flex items-center justify-center gap-2 px-6 py-2 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition"
          >
            Create with AI
          </button>
        </form>

      </div>
    </section>
  );
};

export default Home;