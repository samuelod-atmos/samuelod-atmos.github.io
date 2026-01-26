import os
import yaml
from jinja2 import Environment, FileSystemLoader

OUTPUT_DIR = "docs"

def build():
    # Load content
    with open("content.yaml") as f:
        content = yaml.safe_load(f)

    # Setup Jinja
    env = Environment(loader=FileSystemLoader("templates"))
    template = env.get_template("base.html")

    # Render HTML
    rendered = template.render(**content)

    # Ensure output dir exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Write index.html
    with open(os.path.join(OUTPUT_DIR, "index.html"), "w", encoding="utf-8") as f:
        f.write(rendered)

    # Copy static files
    os.makedirs(os.path.join(OUTPUT_DIR, "static"), exist_ok=True)
    os.system("cp -r static/* docs/static/")

    print("Site built successfully.")

if __name__ == "__main__":
    build()

