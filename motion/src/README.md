# Sources des 2 vidéos animées de la page de vente
- `accroche.html` (29 s) et `visite.html` (38,5 s) : pages d'animation, `window.render(t)` dessine l'image à l'instant t ; format par `?fmt=16x9` ou `?fmt=9x16` (aperçu d'un instant : `&t=12.5`). Moteur commun `engine.js`, charte `base.css`, polices embarquées dans `fonts/`.
- Rendu (Node + Playwright + ffmpeg) : `node render.js accroche.html 9x16 pg-motion-9x16-web-vN.mp4` (idem `16x9`, idem `visite.html`) → 25 i/s, H.264 yuv420p, faststart, sans audio.
- Contrôle rapide : `node render.js visite.html 9x16 essai stills=5,16,30` crée des PNG ; `python3 sheet.py essai 3 planche.png` en fait une planche.
- Poster : `ffmpeg -ss 20.6 -i video.mp4 -frames:v 1 -q:v 3 poster-....jpg` (accroche 7,6 s = 1er résultat ; visite 16 s = documents).
- Règle anti-cache : toute nouvelle version prend un NOUVEAU nom de fichier (-v5, -v7…), jamais l'ancien.
