# tools

`og-card.html` génère les cartes de partage social de `assets/og/`. Ce n'est pas une page du site.

Servir la racine du projet, puis ouvrir le template avec les paramètres `t` (titre), `s` (sous-titre) et `i` (chemin de l'illustration), et capturer en 1200×630 :

```
python3 -m http.server 8899 --bind 127.0.0.1
agent-browser set viewport 1200 630 2
agent-browser open "http://127.0.0.1:8899/tools/og-card.html?t=Titre&s=Sous-titre&i=/assets/illustrations/laptop-mug.png"
agent-browser screenshot assets/og/nom.png
sips -z 630 1200 assets/og/nom.png
sips -s format jpeg -s formatOptions 82 assets/og/nom.png --out assets/og/nom.jpg && rm assets/og/nom.png
```
