import React, { useState } from "react";
import NavBar from "../components/NavBar";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import api from "@/configs/axios";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2Icon } from "lucide-react";

const Home = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { data: session } = authClient.useSession();

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (!session?.user) {
        return toast.error("please sign in to create a project");
      }

      if (!input.trim()) {
        return toast.error("please enter a message");
      }

      setLoading(true);

      const { data } = await api.post("/api/user/projects", {
        initial_prompt: input.trim(),
      });

      navigate(`/projects/${data.projectId}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center overflow-hidden text-center text-white">
      <div className="relative z-50 w-full">
        <NavBar />
      </div>

      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[url('https://assets.prebuiltui.com/images/components/hero-section/hero-galaxy-bg.png')] bg-cover bg-center bg-no-repeat opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />

      <div className="relative z-10 mt-28 flex max-w-4xl flex-col items-center px-4">
        <div className="mb-6 rounded-full border border-white/20 px-4 py-1 text-xs text-slate-300 backdrop-blur">
          ✨ AI-powered presentation builder
        </div>

        <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
          Turn ideas into{" "}
          <span className="text-indigo-400">stunning slides</span> instantly
        </h1>

        <p className="mt-5 max-w-xl text-base text-slate-300 md:text-lg">
          Describe your idea and let AI generate beautiful, structured presentations in seconds.
        </p>

        <form
          onSubmit={onSubmitHandler}
          className="mt-10 w-full max-w-2xl rounded-xl border border-indigo-500/30 bg-white/5 p-4 backdrop-blur"
        >
          <textarea
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Create a pitch deck for a SaaS startup..."
            className="w-full resize-none bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="ml-auto mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          >
            {!loading ? 'Create wiht AI' :(
              <>
                Creating <Loader2Icon className="animate-spin size-4 text-white"/>
              </>
            ) }
          </button>
        </form>
      </div>
    </section>
  );
};

export default Home;