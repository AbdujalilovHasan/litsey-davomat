import { useState } from "react";

function Attendance() {
  const [className, setClassName] = useState("");
  const [totalStudents, setTotalStudents] = useState("");
  const [presentStudents, setPresentStudents] = useState("");

  const [absentStudents, setAbsentStudents] = useState([
    {
      id: 1,
      fullName: "",
      reason: "Kasal",
    },
  ]);

  const [captainName, setCaptainName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxVp94othxh7j_O5W60KILI_pCDftpDtJNFPCCrPlmML8bNLkf3cxocpOegpfAu-ox0/exec";

  const addAbsentStudent = () => {
    setAbsentStudents([
      ...absentStudents,
      {
        id: Date.now(),
        fullName: "",
        reason: "Kasal",
      },
    ]);
  };

  const removeAbsentStudent = (id) => {
    setAbsentStudents(
      absentStudents.filter((student) => student.id !== id)
    );
  };

  const updateAbsentStudent = (id, field, value) => {
    setAbsentStudents(
      absentStudents.map((student) =>
        student.id === id
          ? { ...student, [field]: value }
          : student
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!className.trim()) {
      alert("Iltimos, guruhni kiriting!");
      return;
    }

    if (!totalStudents) {
      alert("Iltimos, jami o'quvchilar sonini kiriting!");
      return;
    }

    if (!presentStudents) {
      alert("Iltimos, kelganlar sonini kiriting!");
      return;
    }

    if (!captainName.trim()) {
      alert("Iltimos, guruh sardorini kiriting!");
      return;
    }

    if (!teacherName.trim()) {
      alert("Iltimos, fan o'qituvchisini kiriting!");
      return;
    }

    const total = Number(totalStudents);
    const present = Number(presentStudents);
    const absentCount = total - present;

    if (total <= 0) {
      alert("Jami o'quvchilar soni 0 dan katta bo'lishi kerak!");
      return;
    }

    if (present < 0 || present > total) {
      alert(
        "Kelgan o'quvchilar soni jami o'quvchilar sonidan ko'p bo'lishi mumkin emas!"
      );
      return;
    }

    if (absentCount !== absentStudents.length) {
      alert(
        `Jami ${absentCount} ta o'quvchi kelmagan bo'lishi kerak. Hozir ${absentStudents.length} ta kiritilgan.`
      );
      return;
    }

    const emptyStudent = absentStudents.some(
      (student) => !student.fullName.trim()
    );

    if (emptyStudent) {
      alert(
        "Kelmagan o'quvchilarning ism-familiyasini to'liq kiriting!"
      );
      return;
    }

    const attendanceData = {
      className: className.trim(),
      totalStudents: total,
      presentStudents: present,
      absentStudents: absentStudents.map((student) => ({
        fullName: student.fullName.trim(),
        reason: student.reason,
      })),
      captainName: captainName.trim(),
      teacherName: teacherName.trim(),
    };

    try {
      setIsLoading(true);

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(attendanceData),
      });

      const text = await response.text();

      console.log("Google Apps Script javobi:", text);

      let result;

      try {
        result = JSON.parse(text);
      } catch (jsonError) {
        console.error("JSON xatosi:", jsonError);
        console.error("Server javobi:", text);

        alert(
          "Google Sheets serveridan noto'g'ri javob keldi!"
        );

        return;
      }

      if (result.success) {
        alert(
          "Davomat muvaffaqiyatli saqlandi!"
        );

        setTotalStudents("");
        setPresentStudents("");

        setAbsentStudents([
          {
            id: Date.now(),
            fullName: "",
            reason: "Kasal",
          },
        ]);

        setCaptainName("");
        setTeacherName("");
      } else {
        alert(
          "Google Sheets xatosi: " +
            (result.error || "Noma'lum xatolik")
        );

        console.error(
          "Google Apps Script xatosi:",
          result.error
        );
      }
    } catch (error) {
      console.error("Google Sheets xatosi:", error);

      alert(
        "Davomatni Google Sheets'ga yuborishda xatolik yuz berdi!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">

        <div className="mb-6">
          <p className="text-sm font-semibold tracking-wide text-blue-600">
            DAVOMAT TIZIMI
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Guruh davomatini kiritish
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Bugungi davomat ma'lumotlarini kiriting.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg">
                🏫
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Guruh ma'lumotlari
                </h2>

                <p className="text-sm text-slate-500">
                  Asosiy davomat ma'lumotlari
                </p>
              </div>

            </div>

            <div className="grid gap-4 md:grid-cols-3">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Guruh
                </label>

                <input
                  type="text"
                  value={className}
                  onChange={(e) =>
                    setClassName(e.target.value)
                  }
                  placeholder="5-25"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Jami o'quvchilar
                </label>

                <input
                  type="number"
                  min="0"
                  value={totalStudents}
                  onChange={(e) =>
                    setTotalStudents(e.target.value)
                  }
                  placeholder="O'quvchilar soni"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Kelganlar soni
                </label>

                <input
                  type="number"
                  min="0"
                  value={presentStudents}
                  onChange={(e) =>
                    setPresentStudents(e.target.value)
                  }
                  placeholder="Kelgan o'quvchilar soni"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-lg">
                  👤
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Kelmagan o'quvchilar
                  </h2>

                  <p className="text-sm text-slate-500">
                    Kelmagan o'quvchilar va sababini kiriting
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={addAbsentStudent}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
              >
                + O'quvchi qo'shish
              </button>

            </div>

            <div className="space-y-3">

              {absentStudents.map((student, index) => (

                <div
                  key={student.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >

                  <div className="mb-3 flex items-center justify-between">

                    <span className="text-sm font-semibold text-slate-700">
                      {index + 1}-o'quvchi
                    </span>

                    {absentStudents.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeAbsentStudent(student.id)
                        }
                        className="text-sm font-medium text-red-500 hover:text-red-700"
                      >
                        O'chirish
                      </button>
                    )}

                  </div>

                  <div className="grid gap-3 md:grid-cols-2">

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Ism-familiyasi
                      </label>

                      <input
                        type="text"
                        value={student.fullName}
                        onChange={(e) =>
                          updateAbsentStudent(
                            student.id,
                            "fullName",
                            e.target.value
                          )
                        }
                        placeholder="Ism Familiya"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Kelmaganlik sababi
                      </label>

                      <select
                        value={student.reason}
                        onChange={(e) =>
                          updateAbsentStudent(
                            student.id,
                            "reason",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="Kasal">
                          Kasal
                        </option>

                        <option value="Sababli">
                          Sababli
                        </option>

                        <option value="Sababsiz">
                          Sababsiz
                        </option>
                      </select>
                    </div>

                  </div>
                </div>

              ))}

            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-lg">
                ⭐
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Guruh sardori
                </h2>

                <p className="text-sm text-slate-500">
                  Davomatni topshirayotgan sardor
                </p>
              </div>

            </div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Sardorning ism-familiyasi
            </label>

            <input
              type="text"
              value={captainName}
              onChange={(e) =>
                setCaptainName(e.target.value)
              }
              placeholder="Ism Familiya"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-lg">
                👤
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Fan o'qituvchisi
                </h2>

                <p className="text-sm text-slate-500">
                  Darsni o'tayotgan ustoz
                </p>
              </div>

            </div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Fan o'qituvchisi ism-familiyasi
            </label>

            <input
              type="text"
              value={teacherName}
              onChange={(e) =>
                setTeacherName(e.target.value)
              }
              placeholder="Ism Familiya"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

          </div>

          <div className="mt-5 flex justify-end">

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-slate-900 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isLoading
                ? "Saqlanmoqda..."
                : "Davomatni saqlash"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default Attendance;