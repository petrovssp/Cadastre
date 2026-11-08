import urllib.request
from urllib.parse import urlparse, parse_qs, quote
import os
from tkinter import Tk
from tkinter.filedialog import askopenfilename, askdirectory

# Hide the root Tk window
Tk().withdraw()

# --- Step 1: Ask user to select the text file with URLs ---
urls_file = askopenfilename(
    title="Select text file with URLs",
    filetypes=[("Text files", "*.txt")]
)
if not urls_file:
    print("No file selected. Exiting.")
    exit()

# --- Step 2: Ask user to select the folder to save downloads ---
save_folder = askdirectory(
    title="Select folder to save downloaded files"
)
if not save_folder:
    print("No folder selected. Exiting.")
    exit()

os.makedirs(save_folder, exist_ok=True)

# --- Step 3: Read URLs from the file ---
with open(urls_file, "r", encoding="utf-8") as f:
    urls = [line.strip() for line in f if line.strip()]

if not urls:
    print("No URLs found in the file. Exiting.")
    exit()

# --- Step 4: Download each URL ---
for url in urls:
    parsed = urlparse(url)

    # Extract ?path= parameter
    query = parse_qs(parsed.query)
    path_value = query.get("path", ["unknown"])[0]

    # URL-encode Cyrillic + spaces
    encoded_path = quote(path_value)
    safe_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}?path={encoded_path}"

    # Create filename from folder + original filename
    parts = path_value.split("/")
    folder = parts[-2]
    filename = parts[-1]
    new_filename = f"{folder}_{filename}"

    # Full path to save file
    full_path = os.path.join(save_folder, new_filename)

    # Download the file
    urllib.request.urlretrieve(safe_url, full_path)
    print("Saved:", full_path)

print("All downloads completed!")