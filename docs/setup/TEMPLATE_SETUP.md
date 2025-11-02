# Setting Up Templates in FastAPI

The landing page has been moved to `backend/templates/landing.html` to match the structure of Clare and Clark.

## FastAPI Configuration Required

To serve the landing page, add this to your main FastAPI app file:

```python
from fastapi import FastAPI
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi import Request
from pathlib import Path

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Setup templates
templates = Jinja2Templates(directory="templates")

# Landing page route
@app.get("/", response_class=HTMLResponse)
async def landing_page(request: Request):
    return templates.TemplateResponse("landing.html", {"request": request})
```

## Directory Structure

```
backend/
├── app/
│   └── main.py              # Add template config here
├── templates/
│   └── landing.html         # Landing page template
├── static/
│   └── images/
│       └── coach-logo.svg   # Logo asset
```

## Testing

1. Make sure you have the required packages:
```bash
pip install jinja2 aiofiles
```

2. Start the FastAPI server:
```bash
cd backend
uvicorn app.main:app --reload
```

3. Visit: `http://localhost:8000/`

## Alternative: Direct HTML Serving

If you don't want to use Jinja2 templates, you can serve the HTML directly:

```python
from fastapi.responses import FileResponse

@app.get("/")
async def landing_page():
    return FileResponse("templates/landing.html")
```

Note: This approach won't support template variables, but works fine for static landing pages.
