import os
import sys
from pathlib import Path

from dotenv import load_dotenv           # pip install python-dotenv
import google.generativeai as genai      # pip install google-generativeai


def main() -> None:
    # ── 0   House-keeping  ───────────────────────────────────────────────────
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        sys.exit("GEMINI_API_KEY not found in environment variables or .env")
    genai.configure(api_key=api_key)

    # PDF name comes from CLI arg or defaults to “sample.pdf” in same folder
    pdf_path = Path(sys.argv[1] if len(sys.argv) > 1 else "sample.pdf")
    if not pdf_path.is_file():
        sys.exit(f"{pdf_path} not found")

    print(f"📄  Uploading {pdf_path.name} …")

    # ── 1   Upload the file to Gemini  ───────────────────────────────────────
    try:
        uploaded_file = genai.upload_file(
            path=str(pdf_path),
            display_name=pdf_path.name,
        )
    except Exception as exc:
        sys.exit(f"Upload failed: {exc}")

    print(f"File uploaded (uri = {uploaded_file.uri})")

    # ── 2   Ask Gemini about the document  ───────────────────────────────────
    model = genai.GenerativeModel("gemini-1.5-pro-latest")  # or flash-latest
    prompt = [
        uploaded_file,
        "Summarize this PDF for a general audience in exactly three sentences."
    ]

    try:
        response = model.generate_content(prompt)
    except Exception as exc:
        sys.exit(f"Gemini request failed: {exc}")

    print("\n────────  GEMINI’S SUMMARY  ────────")
    print(response.text.strip())
    print("─────────────────────────────────────")

    # (Optional) tidy up the remote copy so you don’t fill your file quota
    try:
        genai.delete_file(uploaded_file.name)
    except Exception:
        pass


if __name__ == "__main__":
    main()