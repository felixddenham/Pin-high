"""Builds index.html from src/. Run: python3 build.py"""
import re, os
here=os.path.dirname(os.path.abspath(__file__)); S=lambda f: open(os.path.join(here,"src",f),encoding="utf-8").read()
data="\n".join(S(f) for f in ["masters.js","rare.js","pins.js","schedule.js"] if os.path.exists(os.path.join(here,"src",f)))
html=S("head.html")+"\n</head>\n<body>\n"+S("body.html").replace("/*DATA*/",data)
open(os.path.join(here,"index.html"),"w",encoding="utf-8").write(html)
js=re.findall(r"<script>(.*?)</script>",html,re.S)[0]
os.makedirs(os.path.join(here,".build"),exist_ok=True)
open(os.path.join(here,".build","game.js"),"w",encoding="utf-8").write(js)
print("built index.html")
