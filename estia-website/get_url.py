import urllib.request as u
html = u.urlopen('https://my.spline.design/reactiveorb-LFaygHcVbYHKrJxdQxQSpzO9/').read().decode()
for part in html.replace("'", '"').split('"'):
    if "scene.splinecode" in part:
        print(part)
        break
