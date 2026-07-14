import { NextRequest, NextResponse } from "next/server";

import { bridgeLanguageAndCode } from "@/lib/service-bridge-language-code";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = bridgeLanguageAndCode({
      mode: payload?.mode,
      input: String(payload?.input ?? ""),
      humanLanguage: payload?.humanLanguage,
      codeTarget: payload?.codeTarget,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Language-code bridge failed." },
      { status: 400 },
    );
  }
}
