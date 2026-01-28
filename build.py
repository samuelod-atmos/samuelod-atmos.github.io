import os
import yaml
import shutil
from jinja2 import Environment, FileSystemLoader

OUTPUT_DIR = "docs"

def render_page(env, template_name, output_name, context):
    template = env.get_template(template_name)
    html = template.render(**context)

    with open(os.path.join(OUTPUT_DIR, output_name), "w", encoding="utf-8") as f:
        f.write(html)

def build():
    with open("content.yaml") as f:
        content = yaml.safe_load(f)

    env = Environment(loader=FileSystemLoader("templates"))

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    render_page(env, "index.html", "index.html", content)
    render_page(env, "publications.html", "publications.html", content)
    render_page(env, "plots.html", "plots.html", content)

    shutil.copytree("static", "docs/static", dirs_exist_ok=True)

    print("Site built.")

if __name__ == "__main__":
    build()
