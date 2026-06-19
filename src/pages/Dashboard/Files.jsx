import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Files() {
  const [files, setFiles] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [clientEmail, setClientEmail] = useState("");
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(true);

  async function fetchFiles() {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setFiles(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchFiles();
  }, []);

  async function handleUpload(e) {
    e.preventDefault();

    if (!uploadFile) return;

    const filePath = `${Date.now()}-${uploadFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("client-files")
      .upload(filePath, uploadFile);

    if (uploadError) {
      console.error(uploadError);
      return;
    }

    const { error: dbError } = await supabase.from("files").insert([
      {
        file_name: uploadFile.name,
        file_path: filePath,
        file_type: uploadFile.type,
        category,
        client_email: clientEmail,
      },
    ]);

    if (dbError) {
      console.error(dbError);
      return;
    }

    setUploadFile(null);
    setClientEmail("");
    setCategory("general");
    fetchFiles();
  }

  async function downloadFile(filePath) {
    const { data, error } = await supabase.storage
      .from("client-files")
      .createSignedUrl(filePath, 60);

    if (error) {
      console.error(error);
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  async function deleteFile(file) {
    if (!window.confirm("Delete this file?")) return;

    await supabase.storage.from("client-files").remove([file.file_path]);
    await supabase.from("files").delete().eq("id", file.id);

    fetchFiles();
  }

  if (loading) return <div className="p-10">Loading files...</div>;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <p className="font-semibold text-green-400">NeoEvo Admin</p>
        <h1 className="mt-2 text-4xl font-bold">Files</h1>
        <p className="mt-2 text-gray-400">
          Upload and manage client assets, contracts, logos, and project files.
        </p>
      </div>

      <form
        onSubmit={handleUpload}
        className="mb-8 rounded-2xl border border-white/10 bg-[#0f1c24] p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="file"
            onChange={(e) => setUploadFile(e.target.files[0])}
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          />

          <input
            placeholder="Client email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          >
            <option value="general">General</option>
            <option value="logo">Logo</option>
            <option value="contract">Contract</option>
            <option value="invoice">Invoice</option>
            <option value="image">Image</option>
            <option value="document">Document</option>
          </select>
        </div>

        <button className="mt-5 rounded-lg bg-green-400 px-5 py-2 font-semibold text-black">
          Upload File
        </button>
      </form>

      <div className="grid gap-5">
        {files.map((file) => (
          <div
            key={file.id}
            className="rounded-2xl border border-white/10 bg-[#0f1c24] p-6"
          >
            <h2 className="text-xl font-bold">{file.file_name}</h2>
            <p className="text-gray-400">{file.client_email || "No client email"}</p>
            <p className="mt-1 text-sm capitalize text-green-400">
              {file.category}
            </p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => downloadFile(file.file_path)}
                className="rounded-lg bg-green-400 px-4 py-2 font-semibold text-black"
              >
                Download
              </button>

              <button
                onClick={() => deleteFile(file)}
                className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}