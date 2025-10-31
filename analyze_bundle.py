import re
import json

with open('.next/analyze/client.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

match = re.search(r"window\.chartData = (.*);", html_content)
if match:
    chart_data_json = match.group(1)
    # The json is actually malformed, it ends with a semicolon and some other stuff.
    # I will find the last closing bracket and take everything up to that point.
    last_bracket_index = chart_data_json.rfind(']')
    chart_data_json = chart_data_json[:last_bracket_index+1]
    chart_data = json.loads(chart_data_json)

    # Find all modules and their sizes
    modules = []
    def collect_modules(node):
        if 'groups' in node:
            for group in node['groups']:
                collect_modules(group)
        elif 'id' in node:
            modules.append(node)

    for item in chart_data:
        collect_modules(item)

    # Sort modules by size
    sorted_modules = sorted(modules, key=lambda x: x.get('parsedSize', 0), reverse=True)

    # Print top 10 largest modules
    print("Top 10 largest modules:")
    for module in sorted_modules[:10]:
        print(f"{module['label']}: {module.get('parsedSize', 0)} bytes")
