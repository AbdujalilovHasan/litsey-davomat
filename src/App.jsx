import Attendance from "./pages/Attendance";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-1">
      <Attendance />
      </main>

      <footer className="mt-10 border-t border-slate-200 bg-white px-4 py-6">
  <div className="mx-auto flex max-w-4xl items-center justify-center gap-2 text-sm">
    <span className="text-slate-400">Developed by</span>
    <span className="font-semibold text-slate-800">
      Hasan Abduazizovich Abdujalilov
    </span>
    <span className="text-blue-500">✦</span>
  </div>
</footer>

    </div>
  );
}

export default App;