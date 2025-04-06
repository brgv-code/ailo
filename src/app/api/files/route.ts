import { NextRequest, NextResponse } from "next/server";
import { getProjectFiles } from "@/actions/fileActions";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const project = searchParams.get("project");

  if (!project) {
    return NextResponse.json(
      { error: "Project parameter is required" },
      { status: 400 }
    );
  }

  try {
    const files = await getProjectFiles(project);
    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error fetching project files:", error);
    return NextResponse.json(
      { error: "Failed to fetch project files" },
      { status: 500 }
    );
  }
}
