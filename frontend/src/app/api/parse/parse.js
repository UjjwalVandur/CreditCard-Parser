import { NextResponse } from "next/server";

export async function POST(req) {
  const data = await req.formData();
  const file = data.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const formData = new FormData();
  formData.append("file", file);

  // Call Python backend
  const res = await fetch("http://localhost:8000/parse", {
    method: "POST",
    body: formData,
  });

  const result = await res.json();
  return NextResponse.json(result);
}
