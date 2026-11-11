from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp
import os
import tempfile
import shutil
import glob

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def cleanup_file(path: str):
    try:
        os.remove(path)
        parent_dir = os.path.dirname(path)
        if not os.listdir(parent_dir):
            os.rmdir(parent_dir)
    except Exception:
        pass

@app.get("/api/download")
async def download_video(url: str, bg_tasks: BackgroundTasks):
    if not url:
        raise HTTPException(status_code=400, detail="Thiếu tham số 'url'")

    temp_dir = tempfile.mkdtemp(prefix="wiko_")
    
    # Lấy địa chỉ của PO Token Provider từ Render Environment Variables
    # (Nếu không có, mặc định dùng localhost cho môi trường dev)
    pot_url = os.environ.get("POT_PROVIDER_URL", "http://localhost:4416")

    ydl_opts = {
        'format': 'best[ext=mp4]/best',
        'outtmpl': os.path.join(temp_dir, 'video.%(ext)s'),
        'quiet': True,
        'no_warnings': True,
        'extractor_args': {
            'youtube': {
                'player_client': ['web_safari', 'tv', 'android_vr'],
                # Cấu hình PO Token trỏ đến Provider
                'po_token': [
                    f'web+{pot_url}',
                    f'mweb+{pot_url}',
                    f'tv+{pot_url}'
                ]
            }
        }
    }

    # Nếu có file cookies.txt (dự phòng), vẫn sẽ dùng
    if os.path.exists('cookies.txt'):
        ydl_opts['cookiefile'] = 'cookies.txt'

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        downloaded_files = glob.glob(os.path.join(temp_dir, 'video.*'))
        if not downloaded_files:
            raise HTTPException(status_code=500, detail="Không tìm thấy file video.")
        
        file_path = downloaded_files[0]
        file_extension = os.path.splitext(file_path)[1]

        bg_tasks.add_task(cleanup_file, file_path)

        return FileResponse(
            path=file_path,
            media_type='video/mp4',
            filename=f"wiko_video{file_extension}"
        )

    except yt_dlp.utils.DownloadError as e:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=f"Lỗi tải video: {str(e)}")
    except Exception as e:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=f"Lỗi không xác định: {str(e)}")