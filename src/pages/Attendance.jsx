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

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxVp94othxh7j_O5W60KILI_pCDftpDtJNFPCCrPlmML8bNLkf3cxocpOegpfAu-ox0/exec";

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast({
        show: false,
        type: "",
        message: "",
      });
    }, 3500);
  };

  const addAbsentStudent = () => {
    const total = Number(totalStudents || 0);
    const present = Number(presentStudents || 0);

    const expectedAbsent =
      total > 0 && present >= 0 && present <= total
        ? total - present
        : 0;

    if (
      expectedAbsent > 0 &&
      absentStudents.length >= expectedAbsent
    ) {
      showToast(
        `Faqat ${expectedAbsent} ta kelmagan o'quvchi kiritish mumkin.`,
        "error"
      );
      return;
    }

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
      absentStudents.filter(
        (student) => student.id !== id
      )
    );
  };


  const updateAbsentStudent = (id, field, value) => {
    setAbsentStudents(
      absentStudents.map((student) =>
        student.id === id
          ? {
              ...student,
              [field]: value,
            }
          : student
      )
    );
  };


  const total = Number(totalStudents || 0);
  const present = Number(presentStudents || 0);

  const absentCount =
    total > 0 && present >= 0 && present <= total
      ? total - present
      : 0;

  const enteredAbsentCount = absentStudents.filter(
    (student) => student.fullName.trim() !== ""
  ).length;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!className.trim()) {
      showToast(
        "Iltimos, guruhni kiriting!",
        "error"
      );
      return;
    }

    if (!totalStudents) {
      showToast(
        "Iltimos, jami o'quvchilar sonini kiriting!",
        "error"
      );
      return;
    }

    if (!presentStudents) {
      showToast(
        "Iltimos, kelganlar sonini kiriting!",
        "error"
      );
      return;
    }

    if (total <= 0) {
      showToast(
        "Jami o'quvchilar soni 0 dan katta bo'lishi kerak!",
        "error"
      );
      return;
    }

    if (present < 0 || present > total) {
      showToast(
        "Kelganlar soni jami o'quvchilar sonidan ko'p bo'lishi mumkin emas!",
        "error"
      );
      return;
    }

    if (!captainName.trim()) {
      showToast(
        "Iltimos, guruh sardorini kiriting!",
        "error"
      );
      return;
    }

    if (!teacherName.trim()) {
      showToast(
        "Iltimos, fan o'qituvchisini kiriting!",
        "error"
      );
      return;
    }

    if (enteredAbsentCount !== absentCount) {
      showToast(
        `Kelmagan o'quvchilar ${absentCount} ta bo'lishi kerak. Hozir ${enteredAbsentCount} ta kiritilgan.`,
        "error"
      );
      return;
    }

    const emptyStudent = absentStudents.some(
      (student) => !student.fullName.trim()
    );

    if (emptyStudent) {
      showToast(
        "Kelmagan o'quvchilarning ism-familiyasini to'liq kiriting!",
        "error"
      );
      return;
    }

    const attendanceData = {
      className: className.trim(),

      totalStudents: total,

      presentStudents: present,

      absentStudents: absentStudents.map(
        (student) => ({
          fullName: student.fullName.trim(),
          reason: student.reason,
        })
      ),

      captainName: captainName.trim(),

      teacherName: teacherName.trim(),
    };

    try {
      setIsLoading(true);

      const response = await fetch(
        GOOGLE_SCRIPT_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8",
          },

          body: JSON.stringify(
            attendanceData
          ),
        }
      );

      const text = await response.text();

      console.log(
        "Google Apps Script javobi:",
        text
      );

      let result;

      try {
        result = JSON.parse(text);
      } catch (jsonError) {
        console.error(
          "JSON xatosi:",
          jsonError
        );

        console.error(
          "Server javobi:",
          text
        );

        showToast(
          "Google Sheets serveridan noto'g'ri javob keldi!",
          "error"
        );

        return;
      }

      if (result.success) {
        showToast(
          "Davomat muvaffaqiyatli saqlandi!",
          "success"
        );

        setClassName("");
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

        showToast(
          "Google Sheets xatosi: " +
            (result.error ||
              "Noma'lum xatolik"),
          "error"
        );

        console.error(
          "Google Apps Script xatosi:",
          result.error
        );
      }
    } catch (error) {
      console.error(
        "Google Sheets xatosi:",
        error
      );

      showToast(
        "Davomatni Google Sheets'ga yuborishda xatolik yuz berdi!",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">

      {toast.show && (
        <div
          className={`fixed right-5 top-5 z-[9999] flex max-w-sm items-center gap-3 rounded-2xl px-5 py-4 text-white shadow-2xl transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-600"
              : "bg-red-600"
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
            {toast.type === "success"
              ? "✓"
              : "!"}
          </div>

          <p className="text-sm font-medium leading-5">
            {toast.message}
          </p>
        </div>
      )}

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
                    setClassName(
                      e.target.value
                    )
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
                  min="1"
                  value={totalStudents}
                  onChange={(e) =>
                    setTotalStudents(
                      e.target.value
                    )
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
                    setPresentStudents(
                      e.target.value
                    )
                  }
                  placeholder="Kelgan o'quvchilar soni"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

            </div>

            {total > 0 &&
              present >= 0 &&
              present <= total && (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">


                  <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                    <p className="text-xs font-medium text-blue-600">
                      Jami o'quvchilar
                    </p>

                    <p className="mt-1 text-xl font-bold text-blue-900">
                      {total} ta
                    </p>
                  </div>


                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                    <p className="text-xs font-medium text-emerald-600">
                      Kelgan o'quvchilar
                    </p>

                    <p className="mt-1 text-xl font-bold text-emerald-700">
                      {present} ta
                    </p>
                  </div>


                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                    <p className="text-xs font-medium text-red-600">
                      Kelmagan o'quvchilar
                    </p>

                    <p className="mt-1 text-xl font-bold text-red-700">
                      {absentCount} ta
                    </p>
                  </div>

                </div>
              )}

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

            <div
              className={`mb-5 rounded-xl border px-4 py-3 ${
                total > 0 &&
                enteredAbsentCount ===
                  absentCount
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                <span
                  className={`text-sm font-semibold ${
                    total > 0 &&
                    enteredAbsentCount ===
                      absentCount
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}
                >
                  Kelmagan o'quvchilar:{" "}
                  <strong>
                    {absentCount} ta
                  </strong>
                </span>

                <span
                  className={`text-sm ${
                    total > 0 &&
                    enteredAbsentCount ===
                      absentCount
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  Kiritilgan:{" "}
                  <strong>
                    {enteredAbsentCount} ta
                  </strong>
                </span>

              </div>
            </div>

            <div className="space-y-3">

              {absentStudents.map(
                (student, index) => (

                  <div
                    key={student.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >

                    <div className="mb-3 flex items-center justify-between">

                      <span className="text-sm font-semibold text-slate-700">
                        {index + 1}-o'quvchi
                      </span>

                      {absentStudents.length >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeAbsentStudent(
                              student.id
                            )
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
                          value={
                            student.fullName
                          }
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
                          value={
                            student.reason
                          }
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
                )
              )}

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
                setCaptainName(
                  e.target.value
                )
              }
              placeholder="Ism Familiya"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg">
                👨‍🏫
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
                setTeacherName(
                  e.target.value
                )
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